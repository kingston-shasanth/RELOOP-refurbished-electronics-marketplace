import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('reloop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('reloop_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      const stockLimit = product.stockCount || 10;

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, stockLimit);
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(quantity, stockLimit) }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          const maxStock = item.product.stockCount || 10;
          return { ...item, quantity: Math.min(newQuantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setPromoCode('');
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.refurbishedPrice || 0) * item.quantity,
    0
  );

  const originalTotal = cartItems.reduce(
    (acc, item) => acc + (item.product.originalRetailPrice || item.product.refurbishedPrice || 0) * item.quantity,
    0
  );

  const totalSavings = Math.max(0, originalTotal - subtotal);
  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const estimatedTax = Math.round(subtotal * 0.18); // 18% GST (already inclusive or itemized)
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const applyPromo = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'RELOOP10' || clean === 'RENEW10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setPromoCode(clean);
      return { success: true, message: 'Promo code applied! 10% discount added.' };
    }
    return { success: false, message: 'Invalid or expired promo code.' };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        originalTotal,
        totalSavings,
        deliveryFee,
        estimatedTax,
        grandTotal,
        discountAmount,
        promoCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

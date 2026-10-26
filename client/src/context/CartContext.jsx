import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { subscribeToSync } from '../services/syncChannel';

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

  const [reconciliationNotices, setReconciliationNotices] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const isReconcilingRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem('reloop_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  const reconcileCartWithServer = useCallback(async () => {
    if (isReconcilingRef.current) return;
    try {
      const saved = localStorage.getItem('reloop_cart');
      const itemsToReconcile = saved ? JSON.parse(saved) : [];
      if (!itemsToReconcile || itemsToReconcile.length === 0) return;

      isReconcilingRef.current = true;
      const updatedItems = [];
      const newNotices = [];

      for (const item of itemsToReconcile) {
        if (!item?.product?._id) continue;
        try {
          const res = await api.get(`/products/${item.product._id}`);
          if (res.data?.success && res.data.product) {
            const serverProd = res.data.product;

            // Price change detection
            if (serverProd.refurbishedPrice !== item.product.refurbishedPrice) {
              newNotices.push(
                `Price for "${serverProd.title}" updated from ₹${item.product.refurbishedPrice?.toLocaleString('en-IN')} to ₹${serverProd.refurbishedPrice?.toLocaleString('en-IN')}.`
              );
            }

            // Stock availability check
            let validQty = item.quantity;
            if (serverProd.stockCount <= 0) {
              newNotices.push(`"${serverProd.title}" is currently out of stock.`);
              validQty = 0;
            } else if (item.quantity > serverProd.stockCount) {
              newNotices.push(
                `Quantity for "${serverProd.title}" adjusted to maximum available stock (${serverProd.stockCount}).`
              );
              validQty = serverProd.stockCount;
            }

            updatedItems.push({
              product: {
                ...item.product,
                ...serverProd,
              },
              quantity: validQty,
            });
          } else {
            updatedItems.push(item);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            newNotices.push(`"${item.product.title || 'An item'}" is no longer available in the catalog.`);
            updatedItems.push({
              product: {
                ...item.product,
                stockCount: 0,
                isUnavailable: true,
              },
              quantity: 0,
            });
          } else {
            // Keep existing entry on network failure to avoid wiping cart
            updatedItems.push(item);
          }
        }
      }

      setCartItems(updatedItems);
      if (newNotices.length > 0) {
        setReconciliationNotices((prev) => Array.from(new Set([...prev, ...newNotices])));
      }
    } catch (e) {
      console.warn('[Cart Reconcile Error]:', e);
    } finally {
      isReconcilingRef.current = false;
    }
  }, []);

  // Hydration reconciliation on mount
  useEffect(() => {
    reconcileCartWithServer();
  }, [reconcileCartWithServer]);

  // Sync listener and tab focus revalidation
  useEffect(() => {
    const unsubscribe = subscribeToSync((event) => {
      if (event.entity === 'products') {
        reconcileCartWithServer();
      }
    });

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        reconcileCartWithServer();
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reconcileCartWithServer]);

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

  const dismissNotice = (index) => {
    setReconciliationNotices((prev) => prev.filter((_, i) => i !== index));
  };

  const clearNotices = () => {
    setReconciliationNotices([]);
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
        reconciliationNotices,
        dismissNotice,
        clearNotices,
        reconcileCartWithServer,
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

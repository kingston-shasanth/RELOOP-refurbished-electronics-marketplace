import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { subscribeToSync } from '../services/syncChannel';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('reloop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isReconcilingRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem('reloop_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlistItems]);

  const reconcileWishlistWithServer = useCallback(async () => {
    if (isReconcilingRef.current) return;
    try {
      const saved = localStorage.getItem('reloop_wishlist');
      const itemsToReconcile = saved ? JSON.parse(saved) : [];
      if (!itemsToReconcile || itemsToReconcile.length === 0) return;

      isReconcilingRef.current = true;
      const updatedItems = [];

      for (const item of itemsToReconcile) {
        if (!item?._id) continue;
        try {
          const res = await api.get(`/products/${item._id}`);
          if (res.data?.success && res.data.product) {
            updatedItems.push({
              ...item,
              ...res.data.product,
            });
          } else {
            updatedItems.push(item);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            updatedItems.push({
              ...item,
              stockCount: 0,
              isUnavailable: true,
            });
          } else {
            updatedItems.push(item);
          }
        }
      }

      setWishlistItems(updatedItems);
    } catch (e) {
      console.warn('[Wishlist Reconcile Error]:', e);
    } finally {
      isReconcilingRef.current = false;
    }
  }, []);

  useEffect(() => {
    reconcileWishlistWithServer();
  }, [reconcileWishlistWithServer]);

  useEffect(() => {
    const unsubscribe = subscribeToSync((event) => {
      if (event.entity === 'products') {
        reconcileWishlistWithServer();
      }
    });

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        reconcileWishlistWithServer();
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reconcileWishlistWithServer]);

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

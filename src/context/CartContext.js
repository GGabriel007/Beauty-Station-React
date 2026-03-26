// src/context/CartContext.js
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [includeKit, setIncludeKit] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Always-current refs — safe to read from Hub listeners and async callbacks
  // that would otherwise capture stale closure values
  const cartItemsRef = useRef([]);
  const includeKitRef = useRef(false);
  const userEmailRef = useRef(null);
  const isSyncingFromCloud = useRef(false);

  // Keep refs in sync with state after every render
  useEffect(() => { cartItemsRef.current = cartItems; }, [cartItems]);
  useEffect(() => { includeKitRef.current = includeKit; }, [includeKit]);
  useEffect(() => { userEmailRef.current = userEmail; }, [userEmail]);

  // 1. INITIAL LOAD: Populate from localStorage immediately for fast rendering
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('cartItems');
      const savedKit = localStorage.getItem('includeKit');
      if (savedItems) setCartItems(JSON.parse(savedItems));
      if (savedKit) setIncludeKit(JSON.parse(savedKit));
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
    }
  }, []);

  // Core save — accepts explicit params so it's always safe to call from
  // stale closures (Hub listeners, timeouts). Falls back to refs if not provided.
  const saveCartToCloud = useCallback(async (items, kit, email) => {
    const effectiveEmail = email ?? userEmailRef.current;
    const effectiveItems = items ?? cartItemsRef.current;
    const effectiveKit = kit ?? includeKitRef.current;

    if (!effectiveEmail || isSyncingFromCloud.current) return;

    try {
      const restOperation = post({
        apiName: 'checkoutApi',
        path: '/cart',
        options: {
          body: {
            email: effectiveEmail,
            cartItems: effectiveItems,
            includeKit: effectiveKit,
          },
        },
      });
      await restOperation.response;
    } catch (err) {
      console.error("Error saving cart to cloud", err);
    }
  }, []); // stable — reads from refs, no state deps needed

  const fetchCloudCart = useCallback(async (email) => {
    try {
      isSyncingFromCloud.current = true;
      const restOperation = get({
        apiName: 'checkoutApi',
        path: `/cart?email=${encodeURIComponent(email)}`,
      });
      const { body } = await restOperation.response;
      const data = await body.json();

      if (data.cartItems) {
        setCartItems(data.cartItems);
        setIncludeKit(data.includeKit || false);
      }
    } catch (err) {
      console.error("Error fetching cloud cart", err);
    } finally {
      // Wait for state updates to propagate before re-enabling saves
      setTimeout(() => { isSyncingFromCloud.current = false; }, 500);
    }
  }, []);

  // 2. AUTH SYNC: On mount check current session; listen for sign-in/out events
  useEffect(() => {
    const checkUser = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          setUserEmail(attributes.email);
          fetchCloudCart(attributes.email);
        }
      } catch {
        setUserEmail(null);
      }
    };

    checkUser();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          // BUG FIX: Save the current cart to cloud FIRST using refs (not stale closures)
          // so it's restored on next login. Then wipe locally.
          saveCartToCloud(cartItemsRef.current, includeKitRef.current, userEmailRef.current);
          setUserEmail(null);
          clearCartLocal();
          break;
        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [fetchCloudCart, saveCartToCloud]);

  // 3. PERSISTENCE: Keep localStorage in sync; debounce cloud save as a safety net
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('includeKit', JSON.stringify(includeKit));

    // Skip cloud save if we just fetched from cloud (avoid immediate write-back)
    if (!userEmail || isSyncingFromCloud.current) return;

    const timer = setTimeout(() => {
      saveCartToCloud();
    }, 1500);

    return () => clearTimeout(timer);
  }, [cartItems, includeKit, userEmail, saveCartToCloud]);

  // BUG FIX: Save to cloud immediately on every mutation, not just via the debounce
  // (the debounce can be cancelled by subsequent state changes e.g. logout)
  const addToCart = (item) => {
    const newItems = [...cartItemsRef.current, item];
    cartItemsRef.current = newItems;
    setCartItems(newItems);
    saveCartToCloud(newItems, includeKitRef.current, userEmailRef.current);
  };

  const removeFromCart = (itemToRemove) => {
    const newItems = cartItemsRef.current.filter(i => i !== itemToRemove);
    cartItemsRef.current = newItems;
    setCartItems(newItems);
    saveCartToCloud(newItems, includeKitRef.current, userEmailRef.current);
  };

  // Wrap setIncludeKit so toggling the kit also triggers an immediate cloud save
  const handleSetIncludeKit = (value) => {
    const newKit = typeof value === 'function' ? value(includeKitRef.current) : value;
    includeKitRef.current = newKit;
    setIncludeKit(newKit);
    saveCartToCloud(cartItemsRef.current, newKit, userEmailRef.current);
  };

  const clearCartLocal = () => {
    setCartItems([]);
    setIncludeKit(false);
    cartItemsRef.current = [];
    includeKitRef.current = false;
    localStorage.removeItem('cartItems');
    localStorage.removeItem('includeKit');
  };

  const clearCart = () => {
    // Pass explicit empty values so saveCartToCloud doesn't read stale refs
    saveCartToCloud([], false, userEmailRef.current);
    clearCartLocal();
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, includeKit, setIncludeKit: handleSetIncludeKit }}>
      {children}
    </CartContext.Provider>
  );
};

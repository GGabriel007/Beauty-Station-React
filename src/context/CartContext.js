// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCartItems = localStorage.getItem('cartItems');
      return savedCartItems ? JSON.parse(savedCartItems) : [];
    } catch (e) { return []; }
  });
  
  const [includeKit, setIncludeKit] = useState(() => {
    try {
      const savedIncludeKit = localStorage.getItem('includeKit');
      return savedIncludeKit ? JSON.parse(savedIncludeKit) : false;
    } catch (e) { return false; }
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('includeKit', JSON.stringify(includeKit));
  }, [includeKit]);

  const addToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeFromCart = (itemToRemove) => {
    setCartItems((prevItems) => prevItems.filter(item => item !== itemToRemove));
  };

  const clearCart = () => {
    setCartItems([]);
    setIncludeKit(false);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, includeKit, setIncludeKit }}>
      {children}
    </CartContext.Provider>
  );
};

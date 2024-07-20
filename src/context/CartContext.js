// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [includeKit, setIncludeKit] = useState(false);

  // Load cart items from localStorage when the component mounts
  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems'));
    const savedIncludeKit = JSON.parse(localStorage.getItem('includeKit'));
    if (savedCartItems) {
      setCartItems(savedCartItems);
    }
    if (savedIncludeKit) {
      setIncludeKit(savedIncludeKit);
    }
  }, []);

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

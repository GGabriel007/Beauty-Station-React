// src/pages/CartPage.js
import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore'; 

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const [ notification, setNotification ] = useState ("");

  const handleCheckout = async () => {
    const moduleIds = {
      'Modulo 1 Hair': 'YiqijCCEkEZAIeMVujBc',
      'Module 1.1 Hair': 'js2jxcj3rNWxD7aEHycA',
      'Module 1.2 Hair': 'RVzA81gMYtkv9fIdh18T',
      'Module 1.3 Hair': 'Y152Sb3Ca3AURPUcaMUY',
      'Modulo 2 Hair': 'STw1zDaJNVOMT49f248v',
      'Modulo 3 Hair': '8ccNOMId0Gh8MLFTYlSM',
      'Modulo 4 Hair': 'c7SLqHPwsEeO7Bx7B1PI',
      'Modulo 1 Mkup': 'TbtbRlZRAByiY8FdIWKV',
      'Modulo 2 Mkup': 'jnqzTVshfEhHIbY3XCkE',
      'Modulo 3 Mkup': 'EeXD8HxcyTG6uZ5QJnHf',
      'Modulo 4 Mkup': 'FSPeqUuhkb6L5Q3fVqlP',
    };
  
    try {
      for (const item of cartItems) {
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          await updateDoc(moduleRef, {
            [item.name]: increment(-1)
          });
        } 
      }
        clearCart(); //Clear the cart after successfully!
        setNotification("Purchase completed successfully!");
      } catch (error) {
      console.error("Error updating seats: ", error);
      setNotification("There was an error processing your purchase.");
      }
  };

  return (
    <div>
      <h1>Cart</h1>
      {notification && <p> {notification}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              {item.name} - Q{item.price}
              <button onClick={() => removeFromCart(item)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <button onClick = {handleCheckout}>Checkout</button>
      )}
    </div>
  );
};

export default CartPage;

// src/pages/CartPage.js
import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore'; 

const CartPage = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const handleCheckout = async () => {
    const moduleIds = {
      'Modulo 1': 'ldZlzT5c6Vzr2AW548Jv',    // Module 1 ID
      'Modulo 2': 'lXUmhrh64uRPbPKD8b3P',    // Module 2 ID
      'Modulo 3': '5xowU2Z9pu5U5XG1stO1',    // Module 3 ID
    };
  
    try {
      for (const item of cartItems) {
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          console.log(`Updating module ID: ${moduleId} for item: ${item.name}`);
          const moduleRef = doc(db, "Modulos", moduleId);
          console.log(`Decreasing seats for ${item.name}`);
          await updateDoc(moduleRef, {
            [item.name]: increment(-1)
          });
        } else {
          console.warn(`No module ID found for item: ${item.name}`);
        }
      }
      console.log("Seats updated successfully");
    } catch (error) {
      console.error("Error updating seats: ", error);
    }
  };

  return (
    <div>
      <h1>Cart</h1>
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

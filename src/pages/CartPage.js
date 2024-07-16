// src/pages/CartPage.js
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firestore';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'; 
import { useLocation } from 'react-router-dom';

const CartPage = () => {

  const location = useLocation();
    
  useEffect(() => {

      window.scrollTo(0,0);
  }, [location]);

  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const [ notification, setNotification ] = useState ("");

  const handleCheckout = async () => {
    const moduleIds = {
      'Master Waves 2PM a 4PM': '1Qk3ZTR8Mu9cvxdGGVYER',
      'Master Waves 6PM a 8PM': '2lAsVcE1N0gZl4Iiki3GP',

      'Peinados Para Eventos 2PM a 4PM': '3ASSXgw602WiVe4HpldAP',
      'Peinados Para Eventos 6PM a 8PM': '4rfA37M4cMXl6iO6bSwW4',

      'Maestrías en Novias y Tendencias 2PM a 4PM': '5rHw64GkL6be0GIqiVM17',
      'Maestrías en Novias y Tendencias 6PM a 8PM': '6gh7uXaEGwKGk5Ut2xUOR',

      'Curso Completo Peinado 2PM a 4PM': '7PgoPXqtemmdd1EpAhUMq',
      'Curso Completo Peinado 6PM a 8PM': '8o9SHzxxK9yJVOVds7idf',

      'Pieles Perfectas 2PM a 4PM': '92D9cfiMeVtav2HYhUA9Z',
      'Pieles Perfectas 6PM a 8PM': '931hGzkK3hqpEvLB4C4iSm',

      'Maquillaje Social 2PM a 4PM': '93hiNbQKXTUAUAYdRFeeN3',
      'Maquillaje Social 6PM a 8PM': '94wZBdWsajdmn30YInrflP',

      'Maestría en Novias y Tendencias 2PM a 4PM': '95eyWlva5vbnxaXDuVLmK4',
      'Maestría en Novias y Tendencias 6PM a 8PM': '96xtPAxBtiDBNK01FJbwMl',

      'Curso Completo Maquillaje 2PM a 4PM': '98aq0pkxn574RJGFiIB4CQ',
      'Curso Completo Maquillaje 6PM a 8PM': '99eBJ9cKc7WPtFGBIXFfrB',
    };
  
    try {
      for (const item of cartItems) {
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          const docSnap = await getDoc(moduleRef);

          if (docSnap.exists() && docSnap.data()[item.name] > 0) {
            await updateDoc(moduleRef, {
              [item.name]: increment(-1)
          });
        } else {
          throw new Error (`No hay más asientos disponibles para ${item.name}.`);
        }
      }
    }
      clearCart(); //Clear the cart after successfully!
      setNotification("Purchase completed successfully!");
    } catch (error) {
      console.error("Error updating seats: ", error);
      setNotification("There was an error processing your purchase." + error.message);
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
              {item.name}  Q{item.price}
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

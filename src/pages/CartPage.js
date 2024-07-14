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
      'ModuloHair1': '1VSwAeYljJQaGBGCtX5QS',
      'ModuloHair12': '2VazuBcKueHnslCVblSV3',

      'ModuloHair2': '3ZrzuMZtiHzP6v5zIcD3A',
      'ModuloHair22': '4YMIzbjhX8fXINxAOe6dv',

      'ModuloHair3': '5H9prBtuAlbvJtuNAYq5G',
      'ModuloHair32': '6fUBeqqDaulVrEcTVKHWt',

      'ModuloHair4': '7qLvR1MucGA6logdGDHyj',
      'ModuloHair42': '8vfcvvqcb2YEqe2CI7rbx',

      'ModuloMkup1': '967tegwAK5lwMpwU9rtFj',
      'ModuloMkup12': '990XEge5VwLUT1zUbedxS6P',

      'ModuloMkup2': '991HqChTzDLihkTsdx2o04u',
      'ModuloMkup22': '992eF5bxq0bXkRLAQmZ6D75',

      'ModuloMkup3': '993lWsaMQ5pQ3HZq2n3Mdog',
      'ModuloMkup32': '994cmDnuUQBxtLzEzstm14C',

      'ModuloMkup4': '995O9tIKvDiXZlUPjbbYqVT',
      'ModuloMkup42': '996Ci2BZVreorvwzZP0Utr5',
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

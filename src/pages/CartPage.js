// src/pages/CartPage.js
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firestore';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'; 
import { useLocation } from 'react-router-dom';
import '../styles/CartPage.css';

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
      // Pre-check for seat availability
      for (const item of cartItems) {
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          const docSnap = await getDoc(moduleRef);

          if (!docSnap.exists() || docSnap.data()[item.name] <= 0) {
            throw new Error (` No hay más asientos disponibles para ${item.name}.`);
          }
        }
      }

      // Proceed with the seat update if all items have available seats
      for (const item of cartItems){
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          await updateDoc(moduleRef, {
            [item.name]: increment(-1)
          });
        }
      }
      clearCart(); //Clear the cart after successfully!
      setNotification("¡Compra completada exitosamente!");
    } catch (error) {
      setNotification("Hubo un error al procesar tu compra." + error.message);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
<div>
  <h1 className="header-information-cartpage">Carro</h1>
  <div className="cart-page">
    {notification && <p className="notification">{notification}</p>}
    {cartItems.length === 0 ? (
      <p>Tu carrito esta vacío 🥺</p>
    ) : (
      <div className="cart-container">
        <div className="cart-total-price">
        <div className="cart-items">
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                <img src={item.image} alt={item.name} />
                <div className="name-price">{item.name}  
                <div className="price"> Q{item.price}.00 </div>
                </div>
                <button onClick={() => removeFromCart(item)}>Remover</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="line"></div>
        <div className="total-price">
          <div className='total-text'>TOTAL</div><div className='total-number'>Q{getTotalPrice()}.00</div>
        </div>
        </div>
        <div className="payment">
          <h2>Información del pago</h2>
          <form>
            {/* Add your payment form elements here */}
            <label htmlFor="cardNumber">Número de tarjeta:</label>
            <input type="text" id="cardNumber" name="cardNumber" />
            <label htmlFor="expiryDate">Fecha de caducidad:</label>
            <input type="text" id="expiryDate" name="expiryDate" />
            <label htmlFor="cvv">CVV:</label>
            <input type="text" id="cvv" name="cvv" />
            <button type="submit">Pagar</button>
          </form>
        </div>
      </div>
    )}
    {cartItems.length > 0 && (
      <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
    )}
  </div>
</div>
  );
};

export default CartPage;

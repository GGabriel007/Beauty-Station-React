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

  const { cartItems, removeFromCart, clearCart, includeKit, setIncludeKit } = useContext(CartContext);
  const [notification, setNotification] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
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
    'Curso Completo Maquillaje 6PM a 8PM': '991XsOABf2lp5CdSMm21YR3',

    'Kit de pieles perfectas' : '992U9kQfUcpxR0FpY9l4mDI',

  };

  const handleCheckout = async (event) => {
    event.preventDefault();
  
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

      // Check availability of "Kit de pieles perfectas"
      if (includeKit) {
        const kitRef = doc(db, "Modulos", moduleIds['Kit de pieles perfectas']);
        const kitSnap = await getDoc(kitRef);

        if (!kitSnap.exists() || kitSnap.data()['Kit de pieles perfectas'] <= 0) {
          throw new Error(`No hay más kits disponibles.`);
        }
      }

      // Proceed with the seat update if all items have available seats
      for (const item of cartItems){
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          console.log(`Updating seats for module: ${item.name}`);
          await updateDoc(moduleRef, {
            [item.name]: increment(-1)
          });
          console.log(`Successfully updated seats for module: ${item.name}`);
        }
      }

      // Update the stock of the "Kit de pieles perfectas" if selected
      if (includeKit) {
        const kitRef = doc(db, "Modulos", moduleIds['Kit de pieles perfectas']);
        console.log(`Updating stock for Kit de pieles perfectas`);
        await updateDoc(kitRef, {
          'Kit de pieles perfectas': increment(-1)
        });
        console.log(`Successfully updated stock for Kit de pieles perfectas`);
      }

      clearCart(); //Clear the cart after successfully!
      setPurchaseSuccess(true); // Set purchase success to true
      setNotification("¡Compra completada exitosamente!");
    } catch (error) {
      console.error("Error during checkout:", error);
      setNotification("Hubo un error al procesar tu compra. " + error.message);
    }
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => {
      return total + item.price;
    }, 0);
    return includeKit ? total + 5900 + 500 : total + 500;
  };

  const handleRemoveKit = () => {
    setIncludeKit(false);
  };

  return (
<div>
  <p className="header-information-cartpage">CARRITO</p>

  <div className="information">
    <div className="cart-page">
      {notification && <p className="notification">{notification}</p>}
      {purchaseSuccess ? (
        <div>
          <p>¡Gracias por su compra!</p>
        </div>
      ) : (
        <>
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
                        <div className="name-price">
                          <div className="item-name">{item.name}</div>
                          <div className="price">Q {item.price}.00</div>
                        </div>
                        <button className="cart-page-remove" onClick={() => removeFromCart(item)}>Remover</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="name-price-INS">
                  {includeKit && (
                    <>
                      <div className="item-name-KIT">
                        <p className="kit-name">Kit de pieles perfectas</p>
                        <button className="cart-page-remove-x" onClick={handleRemoveKit}>X</button>
                      </div>
                      <div className="price-kit">Q 5 900.00</div>
                    </>
                  )}
                </div>
                <div className="name-price-INS">
                  <div className="item-name-INST">Incripción</div>
                  <div className="price">Q 500.00</div>
                </div>
                <div className="line"></div>
                <div className="total-price">
                  <div className="total-text">TOTAL</div>
                  <div className="total-number">Q {getTotalPrice()}.00</div>
                </div>
              </div>
              <form className = 'form-from-user' onSubmit={handleCheckout}>
                <div className="information-User">
                  <p className="title-form">Formulario de inscripción 2024</p>
                  <div className="form-user">
                    <label htmlFor="email">Email:*</label>
                    <input type="email" id="email" name="email" required />
                    <label htmlFor="name">Nombre Completo:*</label>
                    <input type="text" id="name" name="name" required />
                    <label htmlFor="instagram">Usuario de Instagram:*</label>
                    <input type="text" id="instagram" name="instagram" required />
                    <label htmlFor="identification">Número de Identificación:* <div className="second-text-form">( DPI o número de Pasaporte)</div></label>
                    <input type="number" id="identification" name="identification" required />
                    <label htmlFor="whatsapp">Número de Whatsapp:*</label>
                    <input type="number" id="whatsapp" name="whatsapp" required />
                    <label htmlFor="nit">Datos de facturación NIT:*</label>
                    <input type="number" id="nit" name="nit" required />
                  </div>
                </div>
                <div className="payment">
                  <p className="title-form">Información del pago</p>
                  <div>
                    <label htmlFor="cardNumber">Número de tarjeta:</label>
                    <input type="number" id="cardNumber" name="cardNumber" required />
                    <label htmlFor="expiryDate">Fecha de caducidad:</label>
                    <input type="number" id="expiryDate" name="expiryDate" required />
                    <label htmlFor="cvv">CVV:</label>
                    <input type="number" id="cvv" name="cvv" required />
                    {cartItems.length > 0 && (
                      <button className="checkout-button" type="submit">Checkout</button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>

  );
};

export default CartPage;

// src/pages/CartPage.js
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firestore';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'; 
import { useLocation } from 'react-router-dom';
import '../styles/CartPage.css';
import { Link } from 'react-router-dom';

const CartPage = () => {

  const location = useLocation();
    
  useEffect(() => {

      window.scrollTo(0,0);
  }, [location]);

  const { cartItems, removeFromCart, clearCart, includeKit, setIncludeKit } = useContext(CartContext);
  const [notification, setNotification] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [formData, setFormData] = useState({

   'entry.1295397219' : '',
   'entry.1830117511': '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    'entry.1913110792': ''
  });
  
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

  useEffect(() => {

    const instagramInput = document.getElementById('instagram');


    const validateInstagramInput = (event) => {
      const regex = /^[a-zA-Z0-9._]*$/;
      if (!regex.test(event.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight']. includes(event.key)){
        event.preventDefault();
      }
    };

    if (instagramInput) {
      instagramInput.addEventListener('keypress', validateInstagramInput);
    }

    return () => {
      if (instagramInput) {
        instagramInput.removeEventListener('keypress', validateInstagramInput);
      }
    };

  }, []);

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
            throw new Error(`No hay más asientos disponibles para ${item.name}.`);
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
      for (const item of cartItems) {
        const moduleId = moduleIds[item.name];
        if (moduleId) {
          const moduleRef = doc(db, "Modulos", moduleId);
          await updateDoc(moduleRef, {
            [item.name]: increment(-1)
          });
        }
      }
  
      // Update the stock of the "Kit de pieles perfectas" if selected
      if (includeKit) {
        const kitRef = doc(db, "Modulos", moduleIds['Kit de pieles perfectas']);
        await updateDoc(kitRef, {
          'Kit de pieles perfectas': increment(-1)
        });
      }

      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('emailAddress', document.querySelector('[name="emailAddress"]').value);
      formData.append('entry.1295397219', document.querySelector('[name="entry.1295397219"]').value);
      formData.append('entry.1830117511', document.querySelector('[name="entry.1830117511"]').value);
      formData.append('entry.637554253', document.querySelector('[name="entry.637554253"]').value);
      formData.append('entry.1913110792', document.querySelector('[name="entry.1913110792"]').value);

      cartItems.forEach(item => {
        formData.append('entry.1855368963', item.name);
      });

      // Append "Kit de pieles perfectas" if included
      if (includeKit) {
        formData.append('entry.1855368963', 'Kit de pieles perfectas');
      }

      // Submit form data using fetch
    const response = await fetch(process.env.REACT_APP_GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });


    if (response.ok) {
      clearCart();
      setPurchaseSuccess(true);
      setNotification("¡Compra completada exitosamente!");
    } else {
      throw new Error("Hubo un error al enviar el formulario.");
    }
  } catch (error) {
    // Check if the error message is "Failed to fetch"
    if (error.message === 'Failed to fetch') {
      clearCart();
      setPurchaseSuccess(true);
      setNotification("¡Compra completada exitosamente!");
    } else {
      // Handle other errors
      setNotification("Hubo un error al procesar tu compra. " + error.message);
    }
  }
};

  const handleNameChange = (e) => {
    const {value} = e.target;
    const regex = /^[a-zA-Z\s]*$/; // Allow only letters and spaces
    if (regex.test(value)) {
      setFormData({ ...formData, name: value});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format the inputs based on the name
    let formattedValue = value;

    switch (name) {

      case 'entry.1295397219':
        formattedValue = value.replace(/\D/g, ''); // Allow only digits
        break;
      case "entry.1830117511":
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/, '$1-').slice(0, 9); // Format as XXXX-XXXX and limit to 8 digits
        break;
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19); // Format as XXXX-XXXX-XXXX-XXXX
        break;
      case 'expiryDate':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5); // Format as XX/XX
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 3); // Allow only 3 digits
        break;
      case "entry.1913110792":
        formattedValue = value.replace(/[^0-9CcFf]/g, ''); // Allow digits and letters C, c, F, f
        break;
      default:
        break;
      }

      setFormData ({
        ...formData,
        [name]: formattedValue,
      });
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

  <div className="information-cart">
    <div className="cart-page">
      {notification && <p className="notification">{notification}</p>}
      {purchaseSuccess ? (
        <div>
          <p>¡Gracias por su compra!</p>
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <div>
            <p>Tu carrito esta vacío 🥺</p>
            <Link to="/classes">
              <div className="browse-button">Explora la tienda</div>
            </Link>
          </div>
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
                      <img src={`${process.env.PUBLIC_URL}/images/Kit-Maquillaje.png`} alt="Icono de maquillaje" />
                      <div className="name-price">
                        <p className="item-name">Kit de pieles perfectas</p>
                        <div className="price">Q 5900.00</div>
                      </div>
                      <button className="cart-page-remove" onClick={handleRemoveKit}>Remover</button>
                    </>
                  )}
                </div>
                <div className="name-price-INS">
                <div className='block'></div>
                <div className="name-price">
                  <p className="item-name">Incripción</p>
                  <div className="price">Q 500.00</div>
                </div>
                <div className='block-remove'></div>
                </div>
                <div className="line"></div>
                <div className="total-price">
                  <div className="total-text">TOTAL</div>
                  <div className="total-number">Q {getTotalPrice()}.00</div>
                </div>
              </div>
              <form id="registration-form"  method="post" className='form-from-user' onSubmit={handleCheckout}>
                <div className="information-User">
                  <p className="title-form">Formulario de inscripción 2024</p>
                  <div className="form-user">
                    <label htmlFor="email" className='form-label'>Email:*</label>
                    
                    <input type="email" id="email" name="emailAddress" placeholder="email@domain.com" required />
                    
                    <label htmlFor="name" className='form-label'>Nombre Completo:*</label>
                    
                        <input
                          pattern="^[a-zA-Z\s]*$"
                          type="text"
                          id="name"
                          name="entry.637554253"
                          value={formData.name}
                          onChange={handleNameChange}
                          title="Sólo se permiten letras y espacios."
                          required
                        />
                    
                    <label htmlFor="instagram" className='form-label'>Usuario de Instagram o Facebook:*</label>
                    
                    <input pattern="^[a-zA-Z0-9._]+$" type="text" id="instagram" name="entry.1580443907" title="Sólo puede tener letras, números, puntos y guiones bajos."  />
                    
                    <label htmlFor="identification" className='form-label'>
                      Número de Identificación:* <div className="second-Text">(DPI o número de Pasaporte)</div>
                    </label>
                    
                    <input
                      type="tel"
                      id="identification"
                      name="entry.1295397219"
                      value={formData['entry.1295397219']}
                      onChange={handleChange}
                      title='Ingresar solamente numeros'
                      pattern="\d+"
                      required
                    />
                    
                    <label htmlFor="whatsapp" className='form-label'>Número de Whatsapp:*</label>
                         
                              <input
                                type="tel"
                                id="whatsapp"
                                name="entry.1830117511"
                                value={formData['entry.1830117511']}
                                onChange={handleChange}
                                maxLength="9"
                                placeholder="XXXX-XXXX"
                                required
                    />
                      
                    <label htmlFor="nit" className='form-label'>Datos de facturación NIT:* <div className="second-Text">Ingresar NIT o CF</div></label>
                    
                    <input 
                    type="text" 
                    id="nit" 
                    name="entry.1913110792" 
                    value={formData['entry.1913110792']}
                    onChange={handleChange}
                    placeholder="1234456778941"
                    title="Coloque su NIT o CF" 
                    required 
                    />
                    
                    </div>
                </div>
                <div className="payment">
                  <p className="title-form">Datos de la tarjeta</p>
                  <div>
                  <label htmlFor="cardNumber" className='form-label'>Número de tarjeta:</label>
                  <div className='input-container'>
                    <input
                      type="tel"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength="19"
                      placeholder="4000-1234-5678-9010"
                      required
                    />
                    <img src={`${process.env.PUBLIC_URL}/images/neopay.png`} alt="NeoNet Logo by NeoNet website" className="input-icon" />
                  </div>


                  <label htmlFor="cardNumber" className='form-label'>Nombre impreso en la tarjeta:</label>
                  
                  <input
                          pattern="^[a-zA-Z\s]*$"
                          type="text"
                          id="name"
                          name="entry.637554253"
                          value={formData.name}
                          onChange={handleNameChange}
                          placeholder="Juan Perez"
                          title="Sólo se permiten letras y espacios."
                          required
                        />
                    
                  <label htmlFor="expiryDate" className='form-label'>Fecha de caducidad:</label>
                  
                  <input
                    type="tel"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    maxLength="5"
                    placeholder="mm/aa"
                    required
                  />
                  
                  <label htmlFor="cvv" className='form-label'>CVV:</label>
                  
                    <input
                      type="tel"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      maxLength="3"
                      placeholder="321"
                      required
                  />
                    
                  {/* Add hidden inputs for each cart item */}
                  {cartItems.map((item, index) => (
                      <input
                        key={index}
                        type="hidden"
                        name="entry.1855368963"
                        value={item.name}
                      />
                    ))}
                    {/* Add hidden input if "Kit de pieles perfectas" is included */}
                    {includeKit && (
                      <input
                        type="hidden"
                        name="entry.1855368963"
                        value="Kit de pieles perfectas"
                      />
                    )}
                    {cartItems.length > 0 && (
                      <button className="checkout-button" type="submit" value = "Submit">Pagar</button>
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

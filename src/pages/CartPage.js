// src/pages/CartPage.js
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import '../styles/CartPage.css';
import { Link } from 'react-router-dom';
import MyComponent from '../context/MyComponent';
import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import { validateCardNumber, validateCVV, validateExpiryDate, hasDangerousContent } from '../utils/validation';





const CartPage = () => {
  const { authStatus, user } = useAuthenticator((context) => [context.authStatus, context.user]);
  const navigate = useNavigate();

  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaptchaSuccess = (token) => {
    setIsCaptchaValid(true);
    setRecaptchaToken(token);
  };

  const renderItemName = (name) => {
    return DOMPurify.sanitize(name);  // Sanitize before rendering
  };

  const [formData, setFormData] = useState({
    'emailAddress': '',
    'entry.1580443907': '',
    'entry.1295397219': '',
    'entry.1830117511': '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    nameCard: '',
    'entry.1913110792': ''
  });

  // Force login and auto-fill user data to securely bind the cart to the authenticated user
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login');
    } else if (authStatus === 'authenticated') {
      Promise.all([fetchUserAttributes(), fetchAuthSession()]).then(([attributes, session]) => {
        const idTokenPayload = session?.tokens?.idToken?.payload || {};
        const bestName = attributes.name || attributes.given_name || idTokenPayload.name || idTokenPayload.given_name || '';
        const bestEmail = attributes.email || idTokenPayload.email || user?.signInDetails?.loginId || '';

        setFormData(prev => ({
          ...prev,
          name: bestName,
          nameCard: bestName, // default to same name for credit card
          emailAddress: bestEmail
        }));
      }).catch(err => console.error("Error pre-filling cart data", err));
    }
  }, [authStatus, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double-submission
    if (isSubmitting) return;

    // Validate form fields
    if (!validateCardNumber(formData.cardNumber)) {
      setNotificationError(DOMPurify.sanitize("¡Tarjeta inválida!"));
      return;
    }

    const expiryDateError = validateExpiryDate(formData.expiryDate);
    if (expiryDateError) {
      setNotificationError(DOMPurify.sanitize(expiryDateError));
      return;
    }

    const cvvError = validateCVV(formData.cvv);
    if (cvvError) {
      setNotificationError(DOMPurify.sanitize(cvvError));
      return;
    }

    if (!isCaptchaValid || !recaptchaToken) {
      toast.warn('Por favor, completa el reCAPTCHA antes de enviar el formulario.', { autoClose: 4000 });
      return;
    }

    setIsSubmitting(true);

    try {
      setNotification(DOMPurify.sanitize("Procesando pago seguro en AWS..."));

      // 1. Submit cart payload securely to AWS REST API (replaces Firebase entirely!)
      const restOperation = post({
        apiName: 'checkoutApi',
        path: '/checkout',
        options: {
          body: {
            email: DOMPurify.sanitize(formData['emailAddress']),
            Name: DOMPurify.sanitize(formData.name),
            userName: DOMPurify.sanitize(formData['entry.1580443907']),
            DPI: DOMPurify.sanitize(formData['entry.1295397219']),
            phoneNumber: DOMPurify.sanitize(formData['entry.1830117511']),
            cartItems: cartItems,
            IncludeKit: includeKit,
            TotalPrice: getTotalPrice(),
            recaptchaToken: recaptchaToken
          }
        }
      });

      const response = await restOperation.response;
      const responseBody = await response.body.json();

      console.log('Secure AWS Checkout successful!', responseBody);



      clearCart();
      setPurchaseSuccess(true);
      setNotification(DOMPurify.sanitize("¡Compra completada exitosamente!"));
      toast.success('¡Compra completada! Recibirás un correo con los detalles de tu registro.', { autoClose: 7000 });

    } catch (error) {
      let errorMsg = error.message;
      try {
        if (error.response) {
          const errObj = await error.response.body.json();
          if (errObj.error) errorMsg = errObj.error;
        }
      } catch (e) { }

      setNotificationError(DOMPurify.sanitize("Hubo un error al procesar tu compra con AWS: " + errorMsg));
      setNotification("");
      toast.error('Error al procesar el pago. Por favor, verifica tus datos e intenta nuevamente.', { autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };



  const location = useLocation();

  useEffect(() => {

    window.scrollTo(0, 0);
  }, [location]);

  const { cartItems, removeFromCart, clearCart, includeKit, setIncludeKit } = useContext(CartContext);
  const [notification, setNotification] = useState("");
  const [notificationError, setNotificationError] = useState("");
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

    'Kit de pieles perfectas': '992U9kQfUcpxR0FpY9l4mDI',

  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    if (hasDangerousContent(value)) {
      setNotificationError(DOMPurify.sanitize('El campo contiene caracteres no permitidos.'));
      return;
    }
    const cleaned = DOMPurify.sanitize(value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 60));
    setFormData({ ...formData, name: cleaned });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reject any input containing XSS / SQL injection / control characters
    if (hasDangerousContent(value)) {
      setNotificationError(DOMPurify.sanitize('El campo contiene caracteres no permitidos.'));
      return;
    }

    let sanitizedValue = DOMPurify.sanitize(value);
    let formattedValue = sanitizedValue;

    switch (name) {
      case 'nameCard':
        // Fix: strip ALL non-letter chars (previous regex only stripped from end of string)
        formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 60);
        break;
      case 'emailAddress':
        formattedValue = value.replace(/[^a-zA-Z0-9.@_+-]/g, '').slice(0, 100);
        break;
      case 'entry.1295397219': // DPI / Passport
        formattedValue = value.replace(/\D/g, '').slice(0, 20);
        break;
      case 'entry.1830117511': // Phone
        formattedValue = value.replace(/\D/g, '').slice(0, 15);
        break;
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19);
        break;
      case 'expiryDate':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
        break;
      case 'entry.1913110792': // NIT
        formattedValue = value.replace(/[^0-9CcFf]/g, '').slice(0, 15);
        break;
      case 'entry.1580443907': // Instagram / Facebook
        formattedValue = value.replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
        break;
      default:
        break;
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => {
      return total + item.price;
    }, 0);
    return includeKit ? total + 5900 + 200 : total + 200;
  };

  const handleRemoveKit = () => {
    setIncludeKit(false);
    toast.info('Kit de Pieles Perfectas eliminado del carrito.', { autoClose: 3000 });
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
              <p>La informacion de tu registro llegara a tu correo electronico. Si no encuentras el correo revisa la seccion de SPAM.</p>
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
                            <button className="cart-page-remove" onClick={() => { removeFromCart(item); toast.info(`"${item.name}" eliminado del carrito.`, { autoClose: 3000 }); }}>Remover</button>
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
                        <div className="price">Q 200.00</div>
                      </div>
                      <div className='block-remove'></div>
                    </div>
                    <div className="line"></div>
                    <div className="total-price">
                      <div className="total-text">TOTAL</div>
                      <div className="total-number">Q {getTotalPrice()}.00</div>
                    </div>
                  </div>
                  <form id="registration-form" method="post" className='form-from-user' onSubmit={handleSubmit}>
                    <div className="information-User">
                      <p className="title-form">Formulario de inscripción</p>
                      <div className="form-user">
                        <label htmlFor="email" className="form-label">Email:*</label>
                        <input
                          type="email"
                          id="email"
                          name="emailAddress"
                          placeholder="email@domain.com"
                          value={formData['emailAddress']}
                          onChange={handleChange}
                          required
                        />

                        <label htmlFor="name" className='form-label'>Nombre Completo:*</label>

                        <input
                          type="text"
                          id="name"
                          name="entry.637554253"
                          value={formData.name}
                          onChange={handleNameChange}
                          maxLength={60}
                          title="Sólo se permiten letras y espacios."
                          required
                        />

                        <label htmlFor="instagram" className='form-label'>
                          Usuario de Instagram o Facebook:*
                        </label>

                        <input
                          type="text"
                          id="instagram"
                          name="entry.1580443907"
                          value={formData['entry.1580443907']}
                          onChange={handleChange}
                          maxLength={40}
                          title="Sólo puede tener letras, números, puntos y guiones bajos."
                          required
                        />

                        <label htmlFor="identification" className='form-label'>
                          Número de Identificación:* <div className="second-Text">(DPI o número de Pasaporte)</div>
                        </label>

                        <input
                          type="tel"
                          id="identification"
                          name="entry.1295397219"
                          value={formData['entry.1295397219']}
                          onChange={handleChange}
                          maxLength={20}
                          title='Ingresar solamente numeros'
                          pattern="\d+"
                          required
                        />

                        <label htmlFor="whatsapp" className='form-label'>Número de Teléfono:*</label>

                        <input
                          type="tel"
                          id="whatsapp"
                          name="entry.1830117511"
                          value={formData['entry.1830117511']}
                          onChange={handleChange}
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
                          maxLength={15}
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
                          type="text"
                          id="nameCard"
                          name="nameCard"
                          value={formData.nameCard}
                          onChange={handleChange}
                          maxLength={60}
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
                          maxLength="4"
                          placeholder="321"
                          required
                        />

                        {notificationError && <p className="error-notification">{notificationError}</p>}

                        {/* Add hidden inputs for each cart item */}
                        {cartItems.map((item, index) => (
                          <div key={index}>
                            <input
                              type="hidden"
                              name="entry.1855368963"
                              value={item.name}
                            /> {renderItemName(item.name) && null}
                          </div>
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
                          <div>

                            <MyComponent onCaptchaSuccess={handleCaptchaSuccess} />

                            <button
                              className="checkout-button"
                              type="submit"
                              disabled={!isCaptchaValid || isSubmitting}
                            >
                              {isSubmitting ? 'Procesando...' : 'Pagar'}
                            </button>

                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-module-cart">
                      <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                      <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
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

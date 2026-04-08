// src/pages/CartPage.js
import React, { useContext, useState, useEffect, useRef } from 'react';
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
import { FiUser, FiCheckCircle, FiLock } from 'react-icons/fi';

const CartPage = () => {
  const { authStatus, user } = useAuthenticator((context) => [context.authStatus, context.user]);
  const navigate = useNavigate();

  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  const COUNTRIES = [
    { code: '+502', label: '🇬🇹 Guatemala +502' },
    { code: '+1',   label: '🇺🇸 EE.UU. / Canadá +1' },
    { code: '+52',  label: '🇲🇽 México +52' },
    { code: '+503', label: '🇸🇻 El Salvador +503' },
    { code: '+504', label: '🇭🇳 Honduras +504' },
    { code: '+505', label: '🇳🇮 Nicaragua +505' },
    { code: '+506', label: '🇨🇷 Costa Rica +506' },
    { code: '+507', label: '🇵🇦 Panamá +507' },
    { code: '+57',  label: '🇨🇴 Colombia +57' },
    { code: '+58',  label: '🇻🇪 Venezuela +58' },
    { code: '+51',  label: '🇵🇪 Perú +51' },
    { code: '+56',  label: '🇨🇱 Chile +56' },
    { code: '+54',  label: '🇦🇷 Argentina +54' },
    { code: '+55',  label: '🇧🇷 Brasil +55' },
    { code: '+593', label: '🇪🇨 Ecuador +593' },
    { code: '+591', label: '🇧🇴 Bolivia +591' },
    { code: '+595', label: '🇵🇾 Paraguay +595' },
    { code: '+598', label: '🇺🇾 Uruguay +598' },
    { code: '+34',  label: '🇪🇸 España +34' },
    { code: '+44',  label: '🇬🇧 Reino Unido +44' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCaptchaSuccess = (token) => {
    setIsCaptchaValid(true);
    setRecaptchaToken(token);
  };

  const renderItemName = (name) => {
    return DOMPurify.sanitize(name);
  };

  const [formData, setFormData] = useState({
    'emailAddress': '',
    'entry.1580443907': '',
    'entry.1295397219': '',
    'entry.1830117511': '',
    phoneCountry: '+502',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    nameCard: '',
    'entry.1913110792': ''
  });

  useEffect(() => {
    if (authStatus === 'authenticated') {
      Promise.all([fetchUserAttributes(), fetchAuthSession()]).then(([attributes, session]) => {
        const idTokenPayload = session?.tokens?.idToken?.payload || {};
        const bestName = attributes.name || attributes.given_name || idTokenPayload.name || idTokenPayload.given_name || '';
        const bestEmail = attributes.email || idTokenPayload.email || user?.signInDetails?.loginId || '';
        setFormData(prev => ({
          ...prev,
          name: bestName,
          nameCard: bestName,
          emailAddress: bestEmail
        }));
      }).catch(err => console.error("Error pre-filling cart data", err));
    }
  }, [authStatus, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const hasOnlineItem = cartItems.some(item => item.online);
    if (hasOnlineItem && authStatus !== 'authenticated') {
      toast.warn('¡Inicia sesión para comprar cursos en línea!', {
        onClick: () => navigate('/login'),
        style: { cursor: 'pointer' },
      });
      navigate('/login');
      return;
    }

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
    if (!termsAccepted) {
      setNotificationError('Debes aceptar los Términos y Condiciones antes de continuar.');
      return;
    }
    if (!isCaptchaValid || !recaptchaToken) {
      toast.warn('Por favor, completa el reCAPTCHA antes de enviar el formulario.', { autoClose: 4000 });
      return;
    }

    setIsSubmitting(true);
    try {
      setNotification(DOMPurify.sanitize("Procesando pago seguro en AWS..."));
      const restOperation = post({
        apiName: 'checkoutApi',
        path: '/checkout',
        options: {
          body: {
            email: DOMPurify.sanitize(formData['emailAddress']),
            Name: DOMPurify.sanitize(formData.name),
            userName: DOMPurify.sanitize(formData['entry.1580443907']),
            DPI: DOMPurify.sanitize(formData['entry.1295397219']),
            phoneNumber: DOMPurify.sanitize(`${formData.phoneCountry} ${formData['entry.1830117511']}`),
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
      const isSeatsError = errorMsg && errorMsg.includes('No hay más asientos disponibles');
      toast.error(
        isSeatsError
          ? errorMsg
          : 'Error al procesar el pago. Por favor, verifica tus datos e intenta nuevamente.',
        { autoClose: 6000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  const { cartItems, removeFromCart, clearCart, includeKit, setIncludeKit } = useContext(CartContext);
  const hasOnlineItem = cartItems.some(item => item.online);
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
    if (hasDangerousContent(value)) {
      setNotificationError(DOMPurify.sanitize('El campo contiene caracteres no permitidos.'));
      return;
    }
    let sanitizedValue = DOMPurify.sanitize(value);
    let formattedValue = sanitizedValue;
    switch (name) {
      case 'nameCard':
        formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 60);
        break;
      case 'emailAddress':
        formattedValue = value.replace(/[^a-zA-Z0-9.@_+-]/g, '').slice(0, 100);
        break;
      case 'entry.1295397219':
        formattedValue = value.replace(/\D/g, '').slice(0, 20);
        break;
      case 'entry.1830117511':
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
      case 'entry.1913110792':
        formattedValue = value.replace(/[^0-9CcFf]/g, '').slice(0, 15);
        break;
      case 'entry.1580443907':
        formattedValue = value.replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
        break;
      default:
        break;
    }
    setFormData({ ...formData, [name]: formattedValue });
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + item.price, 0);
    return includeKit ? total + 5900 + 200 : total + 200;
  };

  const handleRemoveKit = () => {
    setIncludeKit(false);
    toast.info('Kit de Pieles Perfectas eliminado del carrito.', { autoClose: 3000 });
  };

  /* ── Empty cart ── */
  if (!purchaseSuccess && cartItems.length === 0) {
    return (
      <div className="cp-wrapper">
        <h1 className="cp-title">Carrito</h1>
        <div className="cp-empty">
          <p className="cp-empty-icon">🛒</p>
          <p className="cp-empty-text">Tu carrito está vacío</p>
          <p className="cp-empty-sub">¿No sabes por dónde empezar? Explora nuestros cursos.</p>
          <Link to="/classes">
            <button className="cp-browse-btn">Explorar cursos</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Purchase success ── */
  if (purchaseSuccess) {
    return (
      <div className="cp-wrapper">
        <h1 className="cp-title">Carrito</h1>
        <div className="cp-success-card">
          <div className="cp-success-check">✓</div>
          <h2 className="cp-success-heading">¡Gracias por tu compra!</h2>
          <p className="cp-success-text">La información de tu registro llegará a tu correo electrónico. Si no encuentras el correo revisa la sección de SPAM.</p>
          <Link to="/classes">
            <button className="cp-browse-btn">Explorar más cursos</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main cart ── */
  return (
    <div className="cp-wrapper">
      <h1 className="cp-title">Carrito</h1>

      {notification && <p className="cp-processing-note">{notification}</p>}

      <div className="cp-columns">

        {/* ── LEFT: Form ── */}
        <div className="cp-left">

          {/* ── Online course: account required warning ── */}
          {authStatus === 'unauthenticated' && hasOnlineItem && (
            <div className="cp-online-warning">
              <div className="cp-online-warning-icon-wrap">
                <FiLock className="cp-online-warning-icon" />
              </div>
              <h3 className="cp-online-warning-title">Cuenta requerida para cursos en línea</h3>
              <p className="cp-online-warning-body">
                Tu carrito contiene un <strong>curso en línea</strong>. Para completar
                tu compra es necesario iniciar sesión o crear una cuenta gratuita.
              </p>
              <div className="cp-guest-actions">
                <button className="cp-guest-btn-primary" onClick={() => navigate('/login')}>
                  Crear cuenta gratis
                </button>
                <button className="cp-guest-btn-secondary" onClick={() => navigate('/login')}>
                  Ya tengo cuenta — iniciar sesión
                </button>
              </div>
            </div>
          )}

          {/* ── Optional guest banner — only when no online items ── */}
          {authStatus === 'unauthenticated' && !hasOnlineItem && (
            <div className="cp-guest-banner">
              <div className="cp-guest-icon-wrap">
                <FiUser className="cp-guest-icon" />
              </div>
              <h3 className="cp-guest-title">¿Quieres llevar un registro de tus cursos?</h3>
              <p className="cp-guest-subtitle">Crea una cuenta gratuita y podrás:</p>
              <ul className="cp-guest-benefits">
                <li><FiCheckCircle className="cp-guest-check" />Ver todos tus cursos registrados en un solo lugar</li>
                <li><FiCheckCircle className="cp-guest-check" />Consultar tu historial de compras cuando quieras</li>
                <li><FiCheckCircle className="cp-guest-check" />Guardar tu carrito automáticamente al iniciar sesión</li>
              </ul>
              <div className="cp-guest-actions">
                <button className="cp-guest-btn-primary" onClick={() => navigate('/login')}>
                  Crear cuenta gratis
                </button>
                <button className="cp-guest-btn-secondary" onClick={() => navigate('/login')}>
                  Ya tengo cuenta — iniciar sesión
                </button>
              </div>
            </div>
          )}

          <form id="registration-form" method="post" onSubmit={handleSubmit}>

            {/* All form fields in one card */}
            <div className="cp-section">

              <p className="cp-section-title">Datos del Certificado</p>

              <label className="cp-label" htmlFor="email">Email:*</label>
              <input
                type="email" id="email" name="emailAddress"
                placeholder="email@domain.com"
                value={formData['emailAddress']}
                onChange={handleChange} required
              />

              <label className="cp-label" htmlFor="name">Nombre Completo:*</label>
              <input
                type="text" id="name" name="entry.637554253"
                value={formData.name}
                onChange={handleNameChange}
                maxLength={60}
                title="Sólo se permiten letras y espacios." required
              />

              <label className="cp-label" htmlFor="instagram">Usuario de Instagram o Facebook:*</label>
              <input
                type="text" id="instagram" name="entry.1580443907"
                value={formData['entry.1580443907']}
                onChange={handleChange} maxLength={40}
                title="Sólo puede tener letras, números, puntos y guiones bajos." required
              />

              <label className="cp-label" htmlFor="identification">
                Número de Identificación:*
                <span className="cp-label-sub"> (DPI o número de Pasaporte)</span>
              </label>
              <input
                type="tel" id="identification" name="entry.1295397219"
                value={formData['entry.1295397219']}
                onChange={handleChange} maxLength={20}
                title="Ingresa solamente números" pattern="\d+" required
              />

              <label className="cp-label" htmlFor="whatsapp">Número de Teléfono:*</label>
              <div className="cp-phone-row">
                <div className="cp-country-select" ref={countryRef}>
                  <button
                    type="button"
                    className="cp-country-btn"
                    onClick={() => setCountryOpen(o => !o)}
                  >
                    <span>{formData.phoneCountry}</span>
                    <span className="cp-country-chevron">{countryOpen ? '▴' : '▾'}</span>
                  </button>
                  {countryOpen && (
                    <ul className="cp-country-list">
                      {COUNTRIES.map(c => (
                        <li
                          key={c.code}
                          className={`cp-country-item${formData.phoneCountry === c.code ? ' cp-country-item--active' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, phoneCountry: c.code }));
                            setCountryOpen(false);
                          }}
                        >
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="tel" id="whatsapp" name="entry.1830117511"
                  value={formData['entry.1830117511']}
                  onChange={handleChange} placeholder="XXXX-XXXX" required
                />
              </div>

              <label className="cp-label" htmlFor="nit">
                Datos de facturación NIT:*
                <span className="cp-label-sub"> Ingresa NIT o CF</span>
              </label>
              <input
                type="text" id="nit" name="entry.1913110792"
                value={formData['entry.1913110792']}
                onChange={handleChange} maxLength={15}
                placeholder="1234456778941"
                title="Coloca tu NIT o CF" required
              />

              <div className="cp-section-divider"></div>
              <p className="cp-section-title">Datos de Pago</p>

              <label className="cp-label" htmlFor="cardNumber">Número de tarjeta:</label>
              <div className="cp-input-icon-wrap">
                <input
                  type="tel" id="cardNumber" name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange} maxLength="19"
                  placeholder="4000-1234-5678-9010" required
                />
                <img src={`${process.env.PUBLIC_URL}/images/neopay.png`} alt="NeoNet" className="cp-card-logo" />
              </div>

              <label className="cp-label" htmlFor="nameCard">Nombre impreso en la tarjeta:</label>
              <input
                type="text" id="nameCard" name="nameCard"
                value={formData.nameCard}
                onChange={handleChange} maxLength={60}
                placeholder="Juan Perez"
                title="Sólo se permiten letras y espacios." required
              />

              <div className="cp-card-row">
                <div className="cp-card-col">
                  <label className="cp-label" htmlFor="expiryDate">Fecha de caducidad:</label>
                  <input
                    type="tel" id="expiryDate" name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange} maxLength="5"
                    placeholder="mm/aa" required
                  />
                </div>
                <div className="cp-card-col">
                  <label className="cp-label" htmlFor="cvv">CVV:</label>
                  <input
                    type="tel" id="cvv" name="cvv"
                    value={formData.cvv}
                    onChange={handleChange} maxLength="4"
                    placeholder="321" required
                  />
                </div>
              </div>

              <div className="cp-section-divider"></div>
              <p className="cp-section-title">Términos y Condiciones</p>
              <p className="cp-terms-text">
                *Los pagos para este curso son necesarios para asegurar tu cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.
              </p>
              <label className="cp-terms-checkbox-label">
                <input
                  type="checkbox"
                  className="cp-terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setNotificationError('');
                  }}
                />
                He leído y acepto los Términos y Condiciones
              </label>

            </div>

            {/* Hidden inputs */}
            {cartItems.map((item, index) => (
              <div key={index}>
                <input type="hidden" name="entry.1855368963" value={item.name} />
                {renderItemName(item.name) && null}
              </div>
            ))}
            {includeKit && (
              <input type="hidden" name="entry.1855368963" value="Kit de pieles perfectas" />
            )}

            {/* Error + reCAPTCHA + Submit */}
            {notificationError && <p className="error-notification">{notificationError}</p>}
            <MyComponent onCaptchaSuccess={handleCaptchaSuccess} />
            <button
              className="cp-checkout-btn"
              type="submit"
              disabled={!isCaptchaValid || isSubmitting || !termsAccepted || (hasOnlineItem && authStatus !== 'authenticated')}
            >
              {isSubmitting ? 'Procesando...' : 'Pagar'}
            </button>
          </form>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div className="cp-right">
          <div className="cp-summary-card">
            <p className="cp-summary-heading">Resumen del Pedido</p>

            {/* Course items */}
            {cartItems.map((item, index) => (
              <div key={index} className="cp-summary-item">
                {item.courseId ? (
                  <Link to={`/classes/course/${item.courseId}`} className="cp-summary-link">
                    <img src={item.image} alt={item.name} className="cp-summary-img" />
                    <span className="cp-summary-name">{item.name}</span>
                  </Link>
                ) : (
                  <>
                    <img src={item.image} alt={item.name} className="cp-summary-img" />
                    <span className="cp-summary-name">{item.name}</span>
                  </>
                )}
                <span className="cp-summary-price">Q {item.price.toLocaleString('en-US')}.00</span>
                <button
                  className="cp-summary-remove"
                  onClick={() => {
                    removeFromCart(item);
                    toast.info(`"${item.name}" eliminado del carrito.`, { autoClose: 3000 });
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Kit */}
            {includeKit && (
              <div className="cp-summary-item">
                <img src={`${process.env.PUBLIC_URL}/images/Kit-Maquillaje.png`} alt="Kit de maquillaje" className="cp-summary-img" />
                <span className="cp-summary-name">Kit de Pieles Perfectas</span>
                <span className="cp-summary-price">Q 5,900.00</span>
                <button className="cp-summary-remove" onClick={handleRemoveKit}>×</button>
              </div>
            )}

            {/* Inscription fee */}
            <div className="cp-summary-item cp-summary-fee">
              <span className="cp-summary-name">Inscripción</span>
              <span className="cp-summary-price">Q 200.00</span>
            </div>

            {/* Divider + Total */}
            <div className="cp-summary-divider"></div>
            <div className="cp-summary-total-row">
              <span className="cp-summary-total-label">Total</span>
              <span className="cp-summary-total-value">Q {getTotalPrice().toLocaleString('en-US')}.00</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;

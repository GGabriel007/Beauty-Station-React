import React, { useEffect, useState, useContext, useRef } from 'react';
import ReactDOM from 'react-dom';
import '../styles/modules.css';
import { useParams, useLocation, Navigate, useNavigate, Link } from 'react-router-dom';
import useWhatsAppForm from '../hook/useWhatsAppForm';
import { coursesInfo } from '../config/courseData';
import { CartContext } from '../context/CartContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import { toast } from 'react-toastify';
import { FiZoomIn, FiX, FiChevronDown, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';

/* ── Custom cart-added toast ── */
const CartToast = ({ closeToast, courseName, courseImage, includeKit }) => {
    const nav = useNavigate();
    return (
        <div className="cart-toast-content">
            <div className="cart-toast-header">
                <FiCheckCircle className="cart-toast-check-icon" />
                <span>Curso agregado a tu carrito</span>
            </div>
            <div className="cart-toast-course">
                {courseImage && <img src={courseImage} alt="" className="cart-toast-img" />}
                <div className="cart-toast-names">
                    <span className="cart-toast-name">{courseName}</span>
                    {includeKit && (
                        <span className="cart-toast-kit">+ Kit de Pieles Perfectas</span>
                    )}
                </div>
            </div>
            <button
                className="cart-toast-btn-primary"
                onClick={() => { closeToast(); nav('/cart'); }}
            >
                Ver el carrito
            </button>
            <button className="cart-toast-btn-secondary" onClick={closeToast}>
                Continúa comprando
            </button>
        </div>
    );
};

const DB_KEY_MAP = {
    "master-waves-0": "Master Waves 2PM a 4PM",
    "master-waves-1": "Master Waves 6PM a 8PM",
    "peinado-eventos-0": "Peinados Para Eventos 2PM a 4PM",
    "peinado-eventos-1": "Peinados Para Eventos 6PM a 8PM",
    "maestria-novias-0": "Maestrías en Novias y Tendencias 2PM a 4PM",
    "maestria-novias-1": "Maestrías en Novias y Tendencias 6PM a 8PM",
    "master-waves-intensivo-0": "Master Waves 2PM a 4PM",
    "curso-completo-peinado-0": "Curso Completo Peinado 2PM a 4PM",
    "curso-completo-peinado-1": "Curso Completo Peinado 6PM a 8PM",
    "pieles-perfectas-0": "Pieles Perfectas 2PM a 4PM",
    "pieles-perfectas-1": "Pieles Perfectas 6PM a 8PM",
    "maquillaje-social-0": "Maquillaje Social 2PM a 4PM",
    "maquillaje-social-1": "Maquillaje Social 6PM a 8PM",
    "maestria-novias-makeup-0": "Maestría en Novias y Tendencias 2PM a 4PM",
    "maestria-novias-makeup-1": "Maestría en Novias y Tendencias 6PM a 8PM",
    "curso-completo-maquillaje-0": "Curso Completo Maquillaje 2PM a 4PM",
    "curso-completo-maquillaje-1": "Curso Completo Maquillaje 6PM a 8PM",
    "curso-en-linea-0": "Curso en Línea"
};

const MAKEUP_COURSES = [
    'pieles-perfectas',
    'maquillaje-social',
    'maestria-novias-makeup',
    'curso-completo-maquillaje'
];

// Returns all known cart-item names for a courseId (e.g. "master-waves" → ["master waves 2pm a 4pm", "master waves 6pm a 8pm"])
// Uses exact key format ${id}-0, ${id}-1, ... to avoid false matches like "maestria-novias-makeup" when looking up "maestria-novias"
const getCourseCartNames = (id) => {
    const names = [];
    let i = 0;
    while (DB_KEY_MAP[`${id}-${i}`]) {
        names.push(DB_KEY_MAP[`${id}-${i}`].toLowerCase());
        i++;
    }
    return names;
};

const CourseDetails = () => {
    const { courseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const courseData = coursesInfo[courseId];
    const { addToCart, cartItems, includeKit, setIncludeKit } = useContext(CartContext);
    const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus]);

    const isMakeupCourse = MAKEUP_COURSES.includes(courseId);

    const [availableSeats, setAvailableSeats] = useState(null);
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    const [allDbItems, setAllDbItems] = useState([]);
    const [alreadyOwned, setAlreadyOwned] = useState(false);

    const activeDbKey = DB_KEY_MAP[`${courseId}-${selectedScheduleIndex}`];

    useEffect(() => {
        if (!courseData) return;

        async function fetchSeats() {
            try {
                const restOperation = get({
                    apiName: 'checkoutApi',
                    path: '/modulos'
                });
                const response = await restOperation.response;
                const dbItems = await response.body.json();
                setAllDbItems(dbItems);
            } catch (err) {
                console.error("Error fetching live seats:", err);
            }
        }
        fetchSeats();
    }, [courseData]);

    useEffect(() => {
        if (allDbItems.length === 0 || !activeDbKey) {
            setAvailableSeats(null);
            return;
        }
        const courseRecord = allDbItems.find(item => item[activeDbKey] !== undefined);
        if (courseRecord) {
            setAvailableSeats(courseRecord[activeDbKey]);
        } else {
            setAvailableSeats(null);
        }
    }, [allDbItems, activeDbKey]);

    // Check if the authenticated user already purchased this online course
    useEffect(() => {
        if (!courseData?.online) return;
        if (authStatus !== 'authenticated') return;

        async function checkOwnership() {
            try {
                const attrs = await fetchUserAttributes();
                const email = attrs.email || user?.signInDetails?.loginId || '';
                if (!email) return;

                const restOperation = get({
                    apiName: 'checkoutApi',
                    path: '/my-orders',
                    options: { queryParams: { email } }
                });
                const response = await restOperation.response;
                const orders = await response.body.json();

                const owned = (orders || []).some(order =>
                    order.Items && order.Items.toLowerCase().includes('curso en línea')
                );
                setAlreadyOwned(owned);
            } catch (err) {
                console.error('Error checking online course ownership:', err);
            }
        }

        checkOwnership();
    }, [courseData, authStatus, user]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

    const {
        whatsappForm,
        notificationError,
        handleWhatsAppChange,
        handleWhatsAppSubmit
    } = useWhatsAppForm(courseData?.courseName || "");

    const carouselRef = useRef(null);
    const thumbnailsCount = courseData?.images?.count || 0;

    useEffect(() => {
        const handleScroll = () => {
            if (!carouselRef.current || thumbnailsCount === 0) return;
            const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
            if (maxScroll <= 0) return;
            const scrollRatio = carouselRef.current.scrollLeft / maxScroll;
            const newIndex = Math.round(scrollRatio * (thumbnailsCount - 1));
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < thumbnailsCount) {
                setCurrentIndex(newIndex);
            }
        };

        const currentRef = carouselRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [currentIndex, thumbnailsCount]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location, courseId]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [courseId]);

    if (!courseData) {
        return <Navigate to="/classes" />;
    }

    const ext = courseData.images.extension || "Hair";
    const thumbnails = Array.from({ length: courseData.images.count }, (_, i) =>
        `${process.env.PUBLIC_URL}/images/${courseData.images.folder}/imagen_module_${i + 1}${ext}.jpeg`
    );

    const handleThumbnailClick = (src) => {
        setSelectedImage(src);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <div className="information-module">
                {courseId === 'maestria-novias' && <div className="line1-module"></div>}
                <div className="mid-information-module">

                    {/* ── LEFT COLUMN: Gallery carousel ── */}
                    <div className="gallery-module">
                        <div className="gallery-carousel">

                            {/* Main image carousel */}
                            <div className="carousel-track-container" ref={carouselRef}>
                                <div className="carousel-track">
                                    {thumbnails.map((src, index) => (
                                        <div
                                            key={index}
                                            className={`carousel-img-wrap ${index === currentIndex ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedImage(src);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <img
                                                src={src}
                                                alt={`Course image ${index + 1}`}
                                                className="carousel-main-img"
                                            />
                                            <div className="image-zoom-icon">
                                                <FiZoomIn />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation row */}
                            {thumbnails.length > 1 && (
                                <div className="carousel-nav">
                                    <button
                                        className="carousel-arrow"
                                        onClick={() => {
                                            if (!carouselRef.current) return;
                                            const itemWidth = carouselRef.current.clientWidth * 0.8 + 15;
                                            carouselRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
                                        }}
                                        aria-label="Imagen anterior"
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    
                                    <div className="carousel-dots">
                                        {thumbnails.map((_, idx) => (
                                            <span 
                                                key={idx} 
                                                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (!carouselRef.current) return;
                                                    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
                                                    const targetScroll = (maxScroll / (thumbnails.length - 1)) * idx;
                                                    carouselRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        className="carousel-arrow"
                                        onClick={() => {
                                            if (!carouselRef.current) return;
                                            const itemWidth = carouselRef.current.clientWidth * 0.8 + 15;
                                            carouselRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
                                        }}
                                        aria-label="Siguiente imagen"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isModalOpen && ReactDOM.createPortal(
                            <div className="modal" onClick={toggleModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="modal-close-btn" onClick={toggleModal}>
                                        <FiX />
                                    </button>
                                    <img className="modal-image" src={selectedImage} alt="Expanded view" />
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>

                    {/* ── RIGHT COLUMN: Course Info ── */}
                    <div className="text-module">

                        {/* Title */}
                        <h2 className="course-title-module">
                            {courseData.title}
                            {courseData.subtitle && (
                                <>
                                    <br />{courseData.subtitle}
                                    {courseData.subtitleDate && <span className="header-information-date"> {courseData.subtitleDate}</span>}
                                </>
                            )}
                        </h2>

                        {/* Quick info strip */}
                        <div className="course-quick-info">
                            {courseData.level && <span>Nivel: {courseData.level}</span>}
                            <span>Materiales: {courseData.materialsRequired}</span>
                            <span>Los precios no incluyen materiales</span>
                        </div>

                        {/* Price block */}
                        <div className="course-price-block">
                            <div className="course-price-row">
                                <span className="course-price-label">Precio por persona</span>
                                <span className="course-price-value">{courseData.price}</span>
                            </div>
                            <div className="course-price-row">
                                <span className="course-price-label">Inscripción</span>
                                <span className="course-price-value">{courseData.enrollment}</span>
                            </div>
                        </div>

                        {courseData.enrollmentPromo && (
                            <p className="enrollment-promo-text">{courseData.enrollmentPromo}</p>
                        )}

                        {courseData.installments && (
                            <p className="Wed-Class">{courseData.installments}</p>
                        )}

                        {/* Schedule selector */}
                        <div className="course-schedule-container">
                            <label className="course-schedule-label">Elige tu Horario de Inscripción:</label>
                            <div className="course-schedule-buttons">
                                {courseData.scheduleOptions.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`course-schedule-btn ${selectedScheduleIndex === idx ? 'course-schedule-btn--active' : ''}`}
                                        onClick={() => setSelectedScheduleIndex(idx)}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isMakeupCourse && (
                            <label className="kit-checkbox-container" htmlFor="kit-checkbox">
                                <input
                                    type="checkbox"
                                    id="kit-checkbox"
                                    checked={includeKit}
                                    onChange={(e) => setIncludeKit(e.target.checked)}
                                />
                                <span className="kit-checkbox-label">
                                    Incluir "Kit de Pieles Perfectas" Q. 5,900.00
                                </span>
                            </label>
                        )}

                        {courseData.online && alreadyOwned && (
                            <div className="course-owned-banner">
                                <FiCheckCircle className="course-owned-icon" />
                                <div>
                                    <p className="course-owned-title">Ya tienes este curso en tu cuenta</p>
                                    <p className="course-owned-body">
                                        Ve a{' '}
                                        <Link to="/dashboard" className="course-owned-link">Mi Perfil →</Link>
                                        {' '}para continuar viéndolo.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            className={`course-add-cart-btn${(selectedScheduleIndex === null || availableSeats === 0 || alreadyOwned) ? ' course-add-cart-btn--disabled' : ''}`}
                            disabled={selectedScheduleIndex === null || availableSeats === 0 || alreadyOwned}
                            onClick={() => {

                                const priceRaw = courseData.price ? courseData.price.replace(/\D/g, '') : "0";
                                const priceInt = parseInt(priceRaw, 10) || 0;

                                const cartItemName = activeDbKey || `${courseData.title} ${courseData.scheduleOptions[selectedScheduleIndex]}`;

                                const itemNameLower = cartItemName.toLowerCase();

                                // 1. Per-course duplication check — matches against the actual DB key
                                //    names so it works for every course regardless of how
                                //    courseData.title is worded in Spanish.
                                const courseCartNames = getCourseCartNames(courseId);
                                const isAlreadyInCart = cartItems.some(item =>
                                    courseCartNames.includes(item.name.toLowerCase())
                                );

                                if (isAlreadyInCart) {
                                    toast.error(`Ya tienes un cupo para "${courseData.courseName}" en tu carrito. Solo puedes agregar un horario por curso.`, { autoClose: 6000 });
                                    return;
                                }

                                const MAKEUP_SUB_STRINGS = ['pieles perfectas', 'maquillaje social', 'maestría en novias'];

                                if (itemNameLower.includes('curso completo maquillaje')) {
                                    const hasSubCourse = cartItems.some(item => MAKEUP_SUB_STRINGS.some(sub => item.name.toLowerCase().includes(sub)));
                                    if (hasSubCourse) {
                                        toast.error('Ya tienes un curso individual de maquillaje en tu carrito. Elimínalo primero para adquirir el "Curso Completo".', { autoClose: 6000 });
                                        return;
                                    }
                                } else if (MAKEUP_SUB_STRINGS.some(sub => itemNameLower.includes(sub))) {
                                    const hasComplete = cartItems.some(item => item.name.toLowerCase().includes('curso completo maquillaje'));
                                    if (hasComplete) {
                                        toast.error('Ya tienes el "Curso Completo de Maquillaje" en tu carrito, el cual ya incluye esta clase individual.', { autoClose: 6000 });
                                        return;
                                    }
                                }

                                const HAIR_SUB_STRINGS = ['master waves', 'peinados para eventos', 'maestrías en novias'];

                                if (itemNameLower.includes('curso completo peinado')) {
                                    const hasSubCourse = cartItems.some(item => HAIR_SUB_STRINGS.some(sub => item.name.toLowerCase().includes(sub)));
                                    if (hasSubCourse) {
                                        toast.error('Ya tienes un curso individual de peinado en tu carrito. Elimínalo primero para adquirir el "Curso Completo".', { autoClose: 6000 });
                                        return;
                                    }
                                } else if (HAIR_SUB_STRINGS.some(sub => itemNameLower.includes(sub))) {
                                    const hasComplete = cartItems.some(item => item.name.toLowerCase().includes('curso completo peinado'));
                                    if (hasComplete) {
                                        toast.error('Ya tienes el "Curso Completo de Peinado" en tu carrito, el cual ya incluye esta clase individual.', { autoClose: 6000 });
                                        return;
                                    }
                                }

                                addToCart({
                                    name: cartItemName,
                                    price: priceInt,
                                    image: thumbnails[0],
                                    online: courseData.online || false,
                                    courseId: courseId
                                });

                                toast(
                                    (props) => (
                                        <CartToast
                                            {...props}
                                            courseName={cartItemName}
                                            courseImage={thumbnails[0]}
                                            includeKit={includeKit}
                                        />
                                    ),
                                    {
                                        autoClose: 8000,
                                        closeButton: false,
                                        className: 'cart-toast-container',
                                        icon: false,
                                    }
                                );
                            }}
                        >
                            {alreadyOwned ? 'Curso ya adquirido' : availableSeats === 0 ? 'Sin Cupos Disponibles' : 'Añadir al Carrito'}
                        </button>

                        {/* ── Course Details ── */}
                        <div className="course-detail-divider"></div>

                        <p className="class_links-module">Información del Módulo</p>
                        <p>{courseData.description}</p>

                        {courseData.subtitleDate && (
                            <p>INTENSIVO DE <span className='header-information-date'>{courseData.subtitleDate}</span></p>
                        )}

                        {courseData.promo && (
                            <p className={courseData.promo.includes("DEMO") ? "Demo-text" : ""}>
                                {courseData.promo.includes("DEMO") ? <strong>{courseData.promo}</strong> : courseData.promo}
                            </p>
                        )}

                        {courseData.dates && <p>{courseData.dates}</p>}

                        <p className="class_links-module">Clases</p>
                        <h3 className="instructor-heading">Impartido por {courseData.instructor}</h3>
                        <ul>
                            {courseData.classes?.map((cls, idx) => (
                                <li key={idx}>
                                    {cls.isBreak ? (
                                        <p className="Wed-Class"><b>{cls.text}</b></p>
                                    ) : (
                                        <>
                                            <strong>{cls.name} </strong>
                                            {cls.date && <em>{cls.date} </em>}
                                            - {cls.topics}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {courseData.complexClasses && (
                            <ul>
                                {courseData.complexClasses.map((cls, idx) => (
                                    <li key={`complex-${idx}`}>
                                        <strong>{cls.title}</strong>
                                        {cls.sessions.map((session, sIdx) => {
                                            const isDemo = session.includes("Masterclass") || session.includes("Práctica");
                                            const className = session.includes("6 PM") ? "Wed-Class" : "";
                                            return (
                                                <p key={`session-${sIdx}`} className={className}>
                                                    {isDemo ? <em className="course-session-demo">{session}</em> : session}
                                                </p>
                                            );
                                        })}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <p className="class_links-module">{courseData.scheduleOptions.length > 1 ? "Horarios Disponibles" : "Horario"}</p>
                        <ul>
                            {courseData.scheduleOptions.map((opt, idx) => (
                                <li key={idx}>{opt}</li>
                            ))}
                        </ul>

                        {/* WhatsApp Contact Form — collapsible */}
                        <div className="whatsapp-details">
                            <button
                                className="whatsapp-toggle"
                                onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
                            >
                                <span>¿Tienes preguntas? Contáctanos por WhatsApp</span>
                                <FiChevronDown className={`whatsapp-chevron ${isWhatsAppOpen ? 'chevron-open' : ''}`} />
                            </button>

                            {isWhatsAppOpen && (
                                <div className="whatsapp-form-body">
                                    <p className="whatsapp-summary">
                                        Llena el formulario y nos pondremos en contacto contigo por WhatsApp.
                                    </p>
                                    <div className="whatsapp-form">
                                        <label className='form-label'>Nombre Completo:*</label>
                                        <input
                                            pattern="^[a-zA-Z\s]*$"
                                            type="text"
                                            value={whatsappForm.name}
                                            onChange={(e) => handleWhatsAppChange('name', e.target.value)}
                                            title="Sólo se permiten letras y espacios."
                                            required
                                        />

                                        <label className="form-label">Email:</label>
                                        <input
                                            type="email"
                                            placeholder="email@domain.com"
                                            value={whatsappForm.email}
                                            onChange={(e) => handleWhatsAppChange('email', e.target.value)}
                                            title="Ingresa un correo electrónico válido."
                                            required
                                        />

                                        <label className='form-label'>Usuario de Instagram o Facebook:</label>
                                        <input
                                            type="text"
                                            value={whatsappForm.instagram}
                                            onChange={(e) => handleWhatsAppChange('instagram', e.target.value)}
                                            title="Sólo puede tener letras, números, puntos y guiones bajos."
                                            required
                                        />

                                        <label className='form-label'>Número de Identificación:<div className="second-Text">(DPI o número de Pasaporte)</div></label>
                                        <input
                                            type="tel"
                                            value={whatsappForm.dpi}
                                            onChange={(e) => handleWhatsAppChange('dpi', e.target.value)}
                                            title="Ingresa solamente números"
                                            pattern="\d+"
                                            required
                                        />

                                        <label className='form-label'>Número de Teléfono:*</label>
                                        <input
                                            type="tel"
                                            placeholder="XXXX-XXXX"
                                            value={whatsappForm.phone}
                                            onChange={(e) => handleWhatsAppChange('phone', e.target.value)}
                                            title='Ingresa solo números'
                                            required
                                        />

                                        {notificationError && (
                                            <p className="error-notification">{notificationError}</p>
                                        )}

                                        <button className='contact-button' style={{ backgroundColor: '#4caf50', marginTop: '15px' }} type="button" onClick={handleWhatsAppSubmit}>
                                            Regístrate por WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default CourseDetails;

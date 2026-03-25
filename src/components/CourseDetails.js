import React, { useEffect, useState, useContext } from 'react';
import '../styles/modules.css';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import useWhatsAppForm from '../hook/useWhatsAppForm';
import { coursesInfo } from '../config/courseData';
import { CartContext } from '../context/CartContext';
import { get } from 'aws-amplify/api';

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
    "curso-completo-maquillaje-1": "Curso Completo Maquillaje 6PM a 8PM"
};

const MAKEUP_COURSES = [
    'pieles-perfectas',
    'maquillaje-social',
    'maestria-novias-makeup',
    'curso-completo-maquillaje'
];

const CourseDetails = () => {
    const { courseId } = useParams();
    const location = useLocation();
    const courseData = coursesInfo[courseId];
    const { addToCart, includeKit, setIncludeKit } = useContext(CartContext);

    const isMakeupCourse = MAKEUP_COURSES.includes(courseId);

    const [availableSeats, setAvailableSeats] = useState(null);
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
    const [allDbItems, setAllDbItems] = useState([]);
    const [cartNotification, setCartNotification] = useState("");

    const activeDbKey = DB_KEY_MAP[`${courseId}-${selectedScheduleIndex}`];

    // Fetch live DynamoDB seats from our new public API silently on mount
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

    // Recalculate available seats visually whenever DB items load or user changes dropdown
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

    // If the courseId doesn't exist in our data, redirect to classes page
    // We check this at the top level

    const [selectedImage, setSelectedImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use the hook to handle whatsapp logic
    const {
        whatsappForm,
        notificationError,
        handleWhatsAppChange,
        handleWhatsAppSubmit
    } = useWhatsAppForm(courseData?.courseName || "");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location, courseId]);

    // Set the initial image once the courseData is available
    useEffect(() => {
        if (courseData && courseData.images) {
            const ext = courseData.images.extension || "Hair";
            setSelectedImage(`${process.env.PUBLIC_URL}/images/${courseData.images.folder}/imagen_module_1${ext}.jpeg`);
        }
    }, [courseData]);

    if (!courseData) {
        return <Navigate to="/classes" />;
    }

    // Generate the thumbnail paths
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
                <div className="top-information-module">
                    <h2 className="header-information-module">
                        {courseData.title}
                        {courseData.subtitle && (
                            <>
                                <br />{courseData.subtitle}
                                {courseData.subtitleDate && <span className="header-information-date"> {courseData.subtitleDate}</span>}
                            </>
                        )}
                    </h2>
                </div>
                <div className="mid-information-module">
                    <div className="gallery-module">
                        {/* Main Image */}
                        <div className="main-image-module" onClick={toggleModal}>
                            <img
                                id="selectedImage-module"
                                src={selectedImage}
                                alt="Selected Course Information"
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="thumbnails-module">
                            {thumbnails.map((src, index) => (
                                <img
                                    key={index}
                                    className={`thumbnail-module ${selectedImage === src ? "active-thumbnail" : ""
                                        }`}
                                    src={src}
                                    alt={`Thumbnail ${index + 1}`}
                                    onClick={() => handleThumbnailClick(src)}
                                />
                            ))}
                        </div>

                        {/* Modal */}
                        {isModalOpen && (
                            <div className="modal" onClick={toggleModal}>
                                <div className="modal-content">
                                    <img className="modal-image" src={selectedImage} alt="Expanded view" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-module">
                        <p className="class_links-module">Informacion del Módulo:</p>
                        <p>{courseData.description}</p>

                        {courseData.subtitleDate && (
                            <p>INTENSIVO DE <span className='header-information-date'>{courseData.subtitleDate}</span></p>
                        )}

                        {courseData.level && <p>Nivel: {courseData.level}</p>}
                        <p>Materiales Requeridos: {courseData.materialsRequired}</p>
                        <p>Los precios no incluye materiales</p>

                        {courseData.promo && (
                            <p className={courseData.promo.includes("DEMO") ? "Demo-text" : ""}>
                                {courseData.promo.includes("DEMO") ? <strong>{courseData.promo}</strong> : courseData.promo}
                            </p>
                        )}

                        {courseData.dates && <p>{courseData.dates}</p>}

                        <p className="class_links-module">Clases:</p>
                        <h3>IMPARTIDO POR {courseData.instructor}</h3>
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
                                            // Split session string dynamically by Em tags if needed, or simple rendering
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

                        <p className="class_links-module">{courseData.scheduleOptions.length > 1 ? "Elige entre 2 horarios:" : "Horario:"}</p>
                        <ul>
                            {courseData.scheduleOptions.map((opt, idx) => (
                                <li key={idx}>{opt}</li>
                            ))}
                        </ul>

                        <p className="class_links-module">Precio por persona: {courseData.price}</p>
                        <p className="class_links-module">Inscripción: {courseData.enrollment}</p>

                        {courseData.enrollmentPromo && <p className="class_links-module">{courseData.enrollmentPromo}</p>}

                        <p className="Wed-Class"> {courseData.installments}</p>

                        <div className="course-schedule-container">
                            <label className="course-schedule-label">Elige tu Horario de Inscripción:</label>
                            <br />
                            <select
                                value={selectedScheduleIndex}
                                onChange={(e) => setSelectedScheduleIndex(Number(e.target.value))}
                                className="course-schedule-select"
                            >
                                {courseData.scheduleOptions.map((opt, idx) => (
                                    <option key={idx} value={idx}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {availableSeats !== null && (
                            <p className={availableSeats > 5 ? "seats-plenty" : "seats-low"}>
                                Solo quedan {availableSeats} asientos disponibles para este horario
                            </p>
                        )}

                        {isMakeupCourse && (
                            <div className="kit-checkbox-container">
                                <input
                                    type="checkbox"
                                    id="kit-checkbox"
                                    checked={includeKit}
                                    onChange={(e) => setIncludeKit(e.target.checked)}
                                />
                                <label htmlFor="kit-checkbox" className="kit-checkbox-label">
                                    Incluir "Kit de Pieles Perfectas" Q. 5,900.00
                                </label>
                            </div>
                        )}

                        {cartNotification && (
                            <div className="notification" style={{ marginTop: '15px', marginBottom: '15px', backgroundColor: '#4caf50' }}>
                                {cartNotification}
                            </div>
                        )}

                        <button
                            className="course-add-cart-btn"
                            onClick={() => {
                                const priceRaw = courseData.price ? courseData.price.replace(/\D/g, '') : "0";
                                const priceInt = parseInt(priceRaw, 10) || 0;

                                const cartItemName = activeDbKey || `${courseData.title} ${courseData.scheduleOptions[selectedScheduleIndex]}`;

                                addToCart({
                                    name: cartItemName,
                                    price: priceInt,
                                    image: thumbnails[0]
                                });
                                
                                if (includeKit) {
                                    setCartNotification(`¡Agregado al carrito: ${cartItemName} y Kit de Pieles Perfectas!`);
                                } else {
                                    setCartNotification(`¡Agregado al carrito: ${cartItemName}!`);
                                }

                                setTimeout(() => {
                                    setCartNotification("");
                                }, 35000);
                            }}
                        >
                            Añadir al Carrito
                        </button>

                        {/* WhatsApp Quick Form */}
                        <div className="whatsapp-details">
                            <p className="whatsapp-summary">
                                Si quieres contactarnos con más información con respecto a este curso llena la información siguiente
                            </p>
                            <div className="whatsapp-form" style={{ marginTop: '20px' }}>
                                <p className="title-form" style={{ fontSize: '18px', marginBottom: '15px' }}>Formulario de Contacto Directo</p>

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
                                    title="Ingrese un correo electrónico válido."
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
                                    title="Ingresar solamente números"
                                    pattern="\d+"
                                    required
                                />

                                <label className='form-label'>Número de Teléfono:*</label>
                                <input
                                    type="tel"
                                    placeholder="XXXX-XXXX"
                                    value={whatsappForm.phone}
                                    onChange={(e) => handleWhatsAppChange('phone', e.target.value)}
                                    title='Ingrese solo números'
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
                    </div>

                    {thumbnails.length > 1 && (
                        <div className="second-image-module">
                            <img src={thumbnails[1]} alt="Informacion de Cursos" />
                        </div>
                    )}

                    {thumbnails.length > 2 && (
                        <div className="second-image-module">
                            <img src={thumbnails[2]} alt="Informacion de Cursos" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CourseDetails;

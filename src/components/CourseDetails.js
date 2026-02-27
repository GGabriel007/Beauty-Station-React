import React, { useEffect, useState } from 'react';
import '../styles/modules.css';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import useWhatsAppForm from '../hook/useWhatsAppForm';
import { coursesInfo } from '../config/courseData';

const CourseDetails = () => {
    const { courseId } = useParams();
    const location = useLocation();
    const courseData = coursesInfo[courseId];

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
                                                    {isDemo ? <em style={{ marginRight: '5px' }}>{session}</em> : session}
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

                        {/* WhatsApp Quick Form */}
                        <div className="whatsapp-form">
                            <p className="title-form">Reserva tu asiento</p>

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

                            <button className='contact-button' type="button" onClick={handleWhatsAppSubmit}>
                                Regístrate por WhatsApp
                            </button>
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

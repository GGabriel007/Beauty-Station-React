// src/pages/BeautyStation.js
import React, { useState, useRef } from 'react';
import '../styles/beauty-Station.css';
import { Link } from 'react-router-dom';

const BeautyStation = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const galleryRef = useRef(null);

  const images = [
    `${process.env.PUBLIC_URL}/images/social_media/review3.jpeg`,
    `${process.env.PUBLIC_URL}/images/social_media/review2.jpeg`,
    `${process.env.PUBLIC_URL}/images/social_media/review1.jpeg`,
  ];


  const openModal = (src) => {
    setSelectedImage(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = galleryRef.current.clientWidth * 0.75; // Scroll smoothly by 75% of the visible container width
      if (direction === 'left') {
        galleryRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        galleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };


  return (
    <>
      <div className='all-content'>
        <div className="information">
          <div className='image-container-home'>
            <div className="top-imagen-home">
              <img className="background-imagen-home" src={`${process.env.PUBLIC_URL}/images/background.jpeg`} alt="imagen of the salon"/>
              <div className="overlay-home"></div>
              
              <div className="hero-text-container">
                  <h1 className="hero-title">BEAUTY STATION</h1>
                  <p className="hero-subtitle">Aprende nuevas técnicas en nuestros cursos intensivos de belleza, o reserva un servicio profesional a domicilio para tu evento.</p>
              </div>
            </div>
            
            <div className="mid-information">
              <div className="center">
                <Link to="/classes" className="glass-card">
                  <div className="glass-card-image-wrap">
                    <img className="icon" src={`${process.env.PUBLIC_URL}/images/cursos.png`} alt="Informacion de Cursos" />
                  </div>
                  <div className="glass-card-text">CURSOS</div>
                </Link>
              </div>
              <div className="center">
                <Link to="/servicio-a-domicilio" className="glass-card">
                  <div className="glass-card-image-wrap">
                    <img className="icon" src={`${process.env.PUBLIC_URL}/images/eventos.png`} alt="Informacion de Cursos" />
                  </div>
                  <div className="glass-card-text">EVENTOS</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="modern-contact-banner">
            <div className="contact-banner-text">
              <h3>¿Tienes alguna consulta?</h3>
              <p>¡Escríbenos directamente y te responderemos a la brevedad posible!</p>
            </div>
            <a className="contact-banner-btn" href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A" target="_blank" rel="noopener noreferrer">
              <img className="btn-whatsapp-icon" src={`${process.env.PUBLIC_URL}/images/social_media/whatsapp.png`} alt="Whatsapp" />
              ¡Contactar por WhatsApp!
            </a>
          </div>

          <div className="reviews-header">
            <h2 className="reviews-title">Reseñas de Nuestros Clientes</h2>
            <p className="reviews-subtitle">Estas son algunas de las opiniones y comentarios de quienes han confiado en nosotros para realzar su belleza.</p>
          </div>
        </div>

        {/* Scrolling Gallery Container */}
        <div className="gallery-container-wrapper">
          <button className="gallery-arrow left-arrow" onClick={() => scrollGallery('left')}>
            &#10094;
          </button>
          
          <div className="scrolling-wrapper-home" ref={galleryRef}>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Gallery Image ${index + 1}`}
                className="scrolling-image"
                onClick={() => openModal(src)}
              />
            ))}
          </div>

          <button className="gallery-arrow right-arrow" onClick={() => scrollGallery('right')}>
            &#10095;
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content">
              <img className="modal-image" src={selectedImage} alt="Expanded view" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BeautyStation;

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

  const openModal = (src) => { setSelectedImage(src); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedImage(null); };

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = galleryRef.current.clientWidth * 0.75;
      galleryRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">

      {/* ── Intro text — editorial, centered ── */}
      <section
        className="home-intro"
        style={{ backgroundImage: `linear-gradient(rgba(205, 146, 157, 0.72), rgba(205, 146, 157, 0.72)), url('${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg')` }}
      >
        <p className="home-intro-tagline">Maquillaje Profesional · Guatemala</p>
        <img
          src={`${process.env.PUBLIC_URL}/images/beauty-station-logo.png`}
          alt="Beauty Station"
          className="home-intro-logo"
        />
        <p className="home-intro-body">
          Aprende nuevas técnicas en nuestros cursos intensivos de belleza, o reserva
          un servicio profesional a domicilio para tu evento especial.
        </p>
      </section>

      {/* ── Services — 3 cards: Cursos, Cursos en Línea, Eventos ── */}
      <section className="home-cards-section">
        <div className="home-cards-grid">

          <Link to="/classes" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/cursos_graduadas.jpg`} alt="Cursos" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">CURSOS</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

          <Link to="/classes/course/curso-en-linea" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Makeup/imagen_module_1Mkup.jpeg`} alt="Cursos en Línea" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">CURSOS EN LÍNEA</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

          <Link to="/servicio-a-domicilio" className="home-card home-card--link">
            <div className="home-card-img-wrap">
              <img src={`${process.env.PUBLIC_URL}/images/home_eventos_mirror.jpg`} alt="Eventos" className="home-card-img" />
            </div>
            <div className="home-card-body">
              <p className="home-card-name">EVENTOS</p>
              <span className="home-card-btn">MÁS INFORMACIÓN </span>
            </div>
          </Link>

        </div>
      </section>

      {/* ── WhatsApp contact — minimal centered ── */}
      <section className="home-contact">
        <p className="home-contact-label">¿Tienes alguna consulta?</p>
        <h3 className="home-contact-title">Escríbenos directamente</h3>
        <p className="home-contact-body">
          Te responderemos a la brevedad posible y con gusto resolveremos cualquier duda.
        </p>
        <a
          className="home-cta-btn"
          href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contactar por WhatsApp
        </a>
      </section>

      {/* ── Reviews ── */}
      <section className="home-reviews">
        <p className="home-reviews-tagline">Lo que dicen nuestros clientes</p>
        <h2 className="home-reviews-title">Reseñas</h2>
        <p className="home-reviews-body">
          Estas son algunas de las opiniones de quienes han confiado en nosotros
          para realzar su belleza.
        </p>

        <div className="gallery-container-wrapper">
          <button className="gallery-arrow left-arrow" onClick={() => scrollGallery('left')}>&#10094;</button>
          <div className="scrolling-wrapper-home" ref={galleryRef}>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Reseña ${index + 1}`}
                className="scrolling-image"
                onClick={() => openModal(src)}
              />
            ))}
          </div>
          <button className="gallery-arrow right-arrow" onClick={() => scrollGallery('right')}>&#10095;</button>
        </div>
      </section>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content">
            <img className="modal-image" src={selectedImage} alt="Vista ampliada" />
          </div>
        </div>
      )}

    </div>
  );
};

export default BeautyStation;

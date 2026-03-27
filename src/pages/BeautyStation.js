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
      <section className="home-intro">
        <p className="home-intro-tagline">Maquillaje Profesional · Guatemala</p>
        <h1 className="home-intro-title">Beauty Station</h1>
        <p className="home-intro-body">
          Aprende nuevas técnicas en nuestros cursos intensivos de belleza, o reserva
          un servicio profesional a domicilio para tu evento especial.
        </p>
      </section>

      {/* ── Split section — Cursos ── */}
      <section className="home-split">
        <div className="home-split-media">
          <img
            src={`${process.env.PUBLIC_URL}/images/cursos.png`}
            alt="Cursos de maquillaje"
            className="home-split-img"
          />
        </div>
        <div className="home-split-text">
          <p className="home-split-label">Aprende con nosotros</p>
          <h2 className="home-split-title">Cursos</h2>
          <p className="home-split-body">
            Descubre nuestros cursos intensivos diseñados para principiantes y
            profesionales que desean elevar sus técnicas de maquillaje a un nivel
            superior. Aprende con instructoras expertas en un ambiente cálido y
            profesional.
          </p>
          <Link to="/classes" className="home-cta-btn">Ver Cursos</Link>
        </div>
      </section>

      {/* ── Split section — Eventos (reversed) ── */}
      <section className="home-split reverse">
        <div className="home-split-media">
          <img
            src={`${process.env.PUBLIC_URL}/images/eventos.png`}
            alt="Eventos y servicios a domicilio"
            className="home-split-img"
          />
        </div>
        <div className="home-split-text">
          <p className="home-split-label">Servicio a domicilio</p>
          <h2 className="home-split-title">Eventos</h2>
          <p className="home-split-body">
            Servicio profesional de maquillaje a domicilio para bodas, quinceañeras
            y eventos especiales. Llevamos la experiencia Beauty Station hasta donde
            tú estés, con productos de alta calidad y un acabado impecable.
          </p>
          <Link to="/servicio-a-domicilio" className="home-cta-btn">Ver Eventos</Link>
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

// src/pages/CursosEnLinea.js
import React, { useEffect } from 'react';
import '../styles/cursos-en-linea.css';
import { useLocation } from 'react-router-dom';

const CursosEnLinea = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="cel-page">

      {/* ── Hero — same background image as other course pages ── */}
      <div
        className="cel-hero"
        style={{ backgroundImage: `linear-gradient(rgba(205, 146, 157, 0.72), rgba(205, 146, 157, 0.72)), url('${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg')` }}
      >
        <p className="cel-hero-tagline">Beauty Station</p>
        <h1 className="cel-hero-title">Cursos en Línea</h1>
        <p className="cel-hero-subtitle">
          Aprende desde donde estés con nuestros cursos profesionales en línea.
        </p>
      </div>

      {/* ── Main content — two column layout ── */}
      <div className="cel-content">
        <div className="cel-columns">

          {/* Left: image placeholders */}
          {/* Replace cel_main.jpg, cel_gal1.jpg, cel_gal2.jpg when ready */}
          <div className="cel-image-col">
            <img
              src={`${process.env.PUBLIC_URL}/images/cel_main.jpg`}
              alt="Curso en Línea"
              className="cel-img-main"
            />
            <div className="cel-img-row">
              <img
                src={`${process.env.PUBLIC_URL}/images/cel_gal1.jpg`}
                alt="Curso en Línea 1"
                className="cel-img-thumb"
              />
              <img
                src={`${process.env.PUBLIC_URL}/images/cel_gal2.jpg`}
                alt="Curso en Línea 2"
                className="cel-img-thumb"
              />
            </div>
          </div>

          {/* Right: course info */}
          <div className="cel-info-col">
            <span className="cel-badge">Próximamente</span>

            <h2 className="cel-course-title">Curso en Línea</h2>

            {/* Price block — placeholder */}
            <div className="cel-price-block">
              <div className="cel-price-row">
                <span className="cel-price-label">Precio</span>
                <span className="cel-price-value">Próximamente</span>
              </div>
            </div>

            {/* Description — placeholder */}
            <div className="cel-divider"></div>
            <p className="cel-section-label">Información del Curso</p>
            <p className="cel-description">
              La descripción completa de este curso estará disponible muy pronto.
              Estamos preparando el mejor contenido para que puedas aprender desde
              donde estés, a tu propio ritmo y con la calidad que nos caracteriza.
            </p>

            {/* What's included — placeholder */}
            <div className="cel-divider"></div>
            <p className="cel-section-label">¿Qué incluye?</p>
            <ul className="cel-includes-list">
              <li>Contenido disponible próximamente</li>
              <li>Contenido disponible próximamente</li>
              <li>Contenido disponible próximamente</li>
            </ul>

            {/* CTA */}
            <a
              className="cel-cta-btn"
              href="https://api.whatsapp.com/send?phone=50250177803&text=Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20cursos%20en%20l%C3%ADnea"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contáctanos para más información
            </a>
          </div>

        </div>
      </div>

      {/* ── Gallery row — placeholders at the bottom ── */}
      {/* Replace cel_bot1.jpg, cel_bot2.jpg, cel_bot3.jpg when ready */}
      <div className="cel-gallery">
        <img src={`${process.env.PUBLIC_URL}/images/cel_bot1.jpg`} alt="Online course preview 1" className="cel-gallery-img" />
        <img src={`${process.env.PUBLIC_URL}/images/cel_bot2.jpg`} alt="Online course preview 2" className="cel-gallery-img" />
        <img src={`${process.env.PUBLIC_URL}/images/cel_bot3.jpg`} alt="Online course preview 3" className="cel-gallery-img" />
      </div>

    </div>
  );
};

export default CursosEnLinea;

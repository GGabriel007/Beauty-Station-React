// src/pages/BeautySClasses.js
import React, { useEffect } from 'react';
import '../styles/beauty-SClasses.css';
import { Link, useLocation } from 'react-router-dom';

const BeautySClasses = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="classes-page">

      {/* ── Page hero — mirrors home intro style ── */}
      <section
        className="classes-hero"
        style={{ backgroundImage: `linear-gradient(rgba(205, 146, 157, 0.72), rgba(205, 146, 157, 0.72)), url('${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg')` }}
      >
        <p className="classes-hero-tagline">Aprende con nosotras</p>
        <h1 className="classes-hero-title">Cursos</h1>
        <p className="classes-hero-body">
          Elige la categoría que más te interesa y descubre nuestros cursos
          intensivos diseñados para llevar tu técnica al siguiente nivel.
        </p>
      </section>

      {/* ── Category cards grid ── */}
      <section className="classes-grid">

        <Link to="/classes/classes-2" className="classes-card">
          <div className="classes-card-media">
            <img
              src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Mkup.jpeg`}
              alt="Cursos de Maquillaje"
              className="classes-card-img"
            />
            <div className="classes-card-label">Maquillaje</div>
          </div>
          <div className="classes-card-footer">
            <span className="classes-card-title">Maquillaje</span>
            <span className="classes-card-arrow">→</span>
          </div>
        </Link>

        <Link to="/classes/course/curso-en-linea" className="classes-card">
          <div className="classes-card-media">
            <img
              src={`${process.env.PUBLIC_URL}/images/cursos_graduadas.jpg`}
              alt="Cursos en Línea"
              className="classes-card-img"
            />
            <div className="classes-card-label">Cursos en Línea</div>
          </div>
          <div className="classes-card-footer">
            <span className="classes-card-title">Cursos en Línea</span>
            <span className="classes-card-arrow">→</span>
          </div>
        </Link>

        <Link to="/classes/classes-1" className="classes-card">
          <div className="classes-card-media">
            <img
              src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Hair.jpeg`}
              alt="Cursos de Peinado"
              className="classes-card-img"
            />
            <div className="classes-card-label">Peinado</div>
          </div>
          <div className="classes-card-footer">
            <span className="classes-card-title">Peinado</span>
            <span className="classes-card-arrow">→</span>
          </div>
        </Link>

      </section>
    </div>
  );
};

export default BeautySClasses;

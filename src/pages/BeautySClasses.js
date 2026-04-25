// src/pages/BeautySClasses.js
import React, { useEffect } from 'react';
import '../styles/beauty-SClasses.css';
import '../styles/beauty-Station.css';
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

        <Link to="/classes/classes-2" className="home-card home-card--link">
          <div className="home-card-img-wrap">
            <img
              src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Mkup.jpeg`}
              alt="Cursos de Maquillaje"
              className="home-card-img"
            />
          </div>
          <div className="home-card-body">
            <p className="home-card-name">MAQUILLAJE</p>
            <span className="home-card-btn">MÁS INFORMACIÓN</span>
          </div>
        </Link>

        <Link to="/classes/classes-1" className="home-card home-card--link">
          <div className="home-card-img-wrap">
            <img
              src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Hair.jpeg`}
              alt="Cursos de Peinado"
              className="home-card-img"
            />
          </div>
          <div className="home-card-body">
            <p className="home-card-name">PEINADO</p>
            <span className="home-card-btn">MÁS INFORMACIÓN</span>
          </div>
        </Link>

        <div className="home-card home-card--disabled">
          <div className="home-card-img-wrap">
            <img
              src={`${process.env.PUBLIC_URL}/images/cursos_graduadas.jpg`}
              alt="Cursos en Línea"
              className="home-card-img"
            />
          </div>
          <div className="home-card-body">
            <span className="home-card-coming-soon">PRÓXIMAMENTE</span>
            <p className="home-card-name">CURSOS EN LÍNEA</p>
            <span className="home-card-btn home-card-btn--muted">MÁS INFORMACIÓN</span>
          </div>
        </div>

      </section>
    </div>
  );
};

export default BeautySClasses;

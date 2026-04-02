// src/pages/Classes_1.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';

const Classes1 = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="information-class">

      {/* ── Hero — mirrors home & cursos style ── */}
      <div
        className="top-information-class"
        style={{ backgroundImage: `linear-gradient(rgba(205, 146, 157, 0.72), rgba(205, 146, 157, 0.72)), url('${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg')` }}
      >
        <p className="classes-tagline">Categoría</p>
        <h2 className="header-information-class">Cursos de Peinado 2026</h2>
        <p className="subheader-information-class">
          Elige el curso que más se adapte a tus metas y nivel de experiencia.
          Aprende técnicas profesionales con instructoras especializadas.
        </p>
      </div>

      {/* ── Course grid ── */}
      <div className="course-grid">

        <Link to="/classes/course/master-waves-intensivo" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_Day/imagen_module_H.jpeg`} alt="Master en Waves Intensivo" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Master en Waves Intensivo</p>
            <div className="one-day-badge">1 Día</div>
            <div className="course-grid-date">
              <span className="default-text">Bajo Cita</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/master-waves" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Hair.jpeg`} alt="Master en Waves" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Master en Waves</p>
            <div className="course-grid-date">
              <span className="default-text">27 Ene — 17 Feb</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/peinado-eventos" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`} alt="Peinado para Eventos" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Peinado para Eventos</p>
            <div className="course-grid-date">
              <span className="default-text">24 Feb — 7 Abr</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/maestria-novias" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Hair.jpeg`} alt="Maestría en Novias y Tendencias" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Maestría en Novias y Tendencias</p>
            <div className="course-grid-date">
              <span className="default-text">15 Abr — 7 May</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/curso-completo-peinado" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`} alt="Curso Completo" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Curso Completo</p>
            <div className="course-grid-date">
              <span className="default-text">27 Ene — 7 May</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Classes1;

// src/pages/Classes_2.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';

const Classes2 = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="information-class">

      {/* ── Hero — mirrors home & cursos style ── */}
      <div className="top-information-class">
        <p className="classes-tagline">Categoría</p>
        <h2 className="header-information-class">Cursos de Maquillaje 2026</h2>
        <p className="subheader-information-class">
          Elige el curso que más se adapte a tus metas y nivel de experiencia.
          Aprende técnicas profesionales con instructoras especializadas.
        </p>
      </div>

      {/* ── Course grid ── */}
      <div className="course-grid">

        <Link to="/classes/course/pieles-perfectas" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Mkup.jpeg`} alt="Pieles Perfectas" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Pieles Perfectas</p>
            <div className="course-grid-date">
              <span className="default-text">28 Ene — 25 Feb</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/maquillaje-social" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Mkup.jpeg`} alt="Maquillaje Social" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Maquillaje Social</p>
            <div className="course-grid-date">
              <span className="default-text">4 Mar — 8 Abr</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/maestria-novias-makeup" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Mkup.jpeg`} alt="Maestría en Novias y Tendencias" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Maestría en Novias y Tendencias</p>
            <div className="course-grid-date">
              <span className="default-text">15 Abr — 7 May</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

        <Link to="/classes/course/curso-completo-maquillaje" className="course-grid-card">
          <div className="course-grid-img-wrap">
            <img className="course-grid-img" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`} alt="Curso Completo Maquillaje" />
          </div>
          <div className="course-grid-info">
            <p className="course-grid-name">Curso Completo Maquillaje</p>
            <div className="course-grid-date">
              <span className="default-text">28 Ene — 7 May</span>
              <span className="hover-text">Más Información →</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Classes2;

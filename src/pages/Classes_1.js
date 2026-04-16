// src/pages/Classes_1.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';
import { useCourseData } from '../context/CourseDataContext';

const CourseCard = ({ to, id, title, defaultPrimary, defaultHover, dateText, overrideBadge, swapDbImages }) => {
  const coursesData = useCourseData();
  const data = coursesData[id];

  let primary = defaultPrimary;
  let secondary = defaultHover;

  if (data && Array.isArray(data.imageUrls) && data.imageUrls.some(u => u && u.trim())) {
    const validUrls = data.imageUrls.filter(u => u && u.trim());
    if (swapDbImages && validUrls.length > 1) {
      // DB images are stored in wrong order for this course — swap them
      primary   = validUrls[1];
      secondary = validUrls[0];
    } else {
      primary   = validUrls[0];
      secondary = validUrls.length > 1 ? validUrls[1] : validUrls[0];
    }
  }

  return (
    <Link to={to} className="course-grid-card">
      <div className="course-grid-img-wrap">
        <img className="course-grid-img course-grid-img--primary" src={primary} alt={title} />
        <img className="course-grid-img course-grid-img--secondary" src={secondary} alt={`${title} Hover`} />
        {overrideBadge && <div className="one-day-badge">{overrideBadge}</div>}
      </div>
      <div className="course-grid-info">
        <p className="course-grid-name">{title}</p>
        <div className="course-grid-date">
          <span className="default-text">{dateText}</span>
          <span className="hover-text">Más Información →</span>
        </div>
      </div>
    </Link>
  );
};

const Classes1 = () => {
  const location = useLocation();
  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    // Initial check requires a small delay to ensure DOM is fully painted
    setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

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
      <div className="course-grid-wrapper">
        {canScrollLeft && (
          <button className="course-arrow course-arrow--left" onClick={() => scroll('left')}>&#10094;</button>
        )}
        <div className="course-grid" ref={scrollRef} onScroll={checkScroll}>

        <CourseCard
          to="/classes/course/master-waves-intensivo"
          id="master-waves-intensivo"
          title="Master en Waves Intensivo"
          defaultPrimary={`${process.env.PUBLIC_URL}/images/Class_1/Module_Day/imagen_module_H.jpeg`}
          defaultHover={`${process.env.PUBLIC_URL}/images/Class_1/Module_Day/Hair/imagen_module_2Hair.jpeg`}
          dateText="Bajo Cita"
          overrideBadge="1 Día"
        />

        <CourseCard
          to="/classes/course/master-waves"
          id="master-waves"
          title="Master en Waves"
          defaultPrimary={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_1Hair.jpeg`}
          defaultHover={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_2Hair.jpeg`}
          dateText="27 Ene — 17 Feb"
          swapDbImages
        />

        <CourseCard
          to="/classes/course/peinado-eventos"
          id="peinado-eventos"
          title="Peinado para Eventos"
          defaultPrimary={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`}
          defaultHover={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_2Hair.jpeg`}
          dateText="24 Feb — 7 Abr"
        />

        <CourseCard
          to="/classes/course/maestria-novias"
          id="maestria-novias"
          title="Maestría en Novias y Tendencias"
          defaultPrimary={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Hair.jpeg`}
          defaultHover={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_2Hair.jpeg`}
          dateText="15 Abr — 7 May"
        />

        <CourseCard
          to="/classes/course/curso-completo-peinado"
          id="curso-completo-peinado"
          title="Curso Completo"
          defaultPrimary={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`}
          defaultHover={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_2Hair.jpeg`}
          dateText="27 Ene — 7 May"
        />

        </div>
        {canScrollRight && (
          <button className="course-arrow course-arrow--right" onClick={() => scroll('right')}>&#10095;</button>
        )}
      </div>

    </div>
  );
};

export default Classes1;

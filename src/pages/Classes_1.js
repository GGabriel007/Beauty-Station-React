// src/pages/Classes_1.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';
import { useCourseData } from '../context/CourseDataContext';

const CourseCard = ({ id, course }) => {
  let primary, secondary;

  if (Array.isArray(course.imageUrls) && course.imageUrls.some(u => u && u.trim())) {
    const validUrls = course.imageUrls.filter(u => u && u.trim());
    if (course.swapImages && validUrls.length > 1) {
      primary   = validUrls[1];
      secondary = validUrls[0];
    } else {
      primary   = validUrls[0];
      secondary = validUrls.length > 1 ? validUrls[1] : validUrls[0];
    }
  } else if (course.cardImage) {
    primary   = `${process.env.PUBLIC_URL}/images/${course.cardImage}`;
    secondary = course.cardImageHover
      ? `${process.env.PUBLIC_URL}/images/${course.cardImageHover}`
      : primary;
  } else {
    primary   = `${process.env.PUBLIC_URL}/images/beauty-station-hero.jpeg`;
    secondary = primary;
  }

  const dateText = course.cardDateText || course.dates || 'Próximamente';

  return (
    <Link to={`/classes/course/${id}`} className="course-grid-card">
      <div className="course-grid-img-wrap">
        <img className="course-grid-img course-grid-img--primary"   src={primary}   alt={course.courseName} />
        <img className="course-grid-img course-grid-img--secondary" src={secondary} alt={`${course.courseName} Hover`} />
        {course.overrideBadge && <div className="one-day-badge">{course.overrideBadge}</div>}
      </div>
      <div className="course-grid-info">
        <p className="course-grid-name">{course.courseName}</p>
        <div className="course-grid-date">
          <span className="default-text">{dateText}</span>
          <span className="hover-text">Más Información →</span>
        </div>
      </div>
    </Link>
  );
};

const Classes1 = () => {
  const location  = useLocation();
  const scrollRef = useRef(null);
  const coursesData = useCourseData();

  const hairCourses = Object.entries(coursesData)
    .filter(([, c]) => c.category === 'hair')
    .sort(([, a], [, b]) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [hairCourses.length]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="information-class">

      {/* ── Hero ── */}
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
          {hairCourses.map(([id, course]) => (
            <CourseCard key={id} id={id} course={course} />
          ))}
        </div>
        {canScrollRight && (
          <button className="course-arrow course-arrow--right" onClick={() => scroll('right')}>&#10095;</button>
        )}
      </div>

    </div>
  );
};

export default Classes1;

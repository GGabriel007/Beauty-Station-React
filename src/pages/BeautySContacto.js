// src/pages/BeautySContacto.js
import React, { useEffect, useState, useCallback } from 'react';
import '../styles/beauty-SContacto.css';
import { useLocation, Link } from 'react-router-dom';

const GALLERY_IMAGES = [
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal1.jpg`, alt: 'Beauty Station 1' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal2.jpg`, alt: 'Beauty Station 2' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal3.jpg`, alt: 'Beauty Station 3' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal4.jpg`, alt: 'Beauty Station 4' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal5.jpg`, alt: 'Beauty Station 5' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal6.jpg`, alt: 'Beauty Station 6' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal7.jpg`, alt: 'Beauty Station 7' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal8.jpg`, alt: 'Beauty Station 8' },
  { src: `${process.env.PUBLIC_URL}/images/nosotros_gal9.jpg`, alt: 'Beauty Station 9' },
];

const BeautySContacto = () => {
  const location = useLocation();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() =>
    setLightboxIndex(i => (i + 1) % GALLERY_IMAGES.length), []);

  const goPrev = useCallback(() =>
    setLightboxIndex(i => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, goNext, goPrev]);

  return (
    <>
      <div className="nosotros-page-container">

        {/* ── TOP: Staggered layout — image left, bio box right ── */}
        <div className="nosotros-staggered-layout">

          <div className="nosotros-content-box">
            <h1 className="nosotros-elegant-title">BEAUTY STATION</h1>

            <p className="nosotros-elegant-bio">
              Beauty Station es uno de los mejores equipos de belleza en Guatemala, especializado en maquillaje, peinado, bodas y eventos especiales. Con más de 11 años de experiencia en la industria nupcial, nuestro equipo está capacitado con técnicas internacionales para ofrecerte resultados de nivel mundial.
            </p>

            <p className="nosotros-elegant-bio">
              Liderado por Aleh, artista senior certificada internacionalmente y referente de la belleza nupcial en Guatemala, nuestro equipo combina pasión, precisión y estilo en cada trabajo. Desde looks elegantes para novias hasta peinados y maquillajes para ocasiones especiales, en Beauty Station transformamos cada detalle en arte.
            </p>

            <Link to="/classes" className="nosotros-button-link">
              <button className="elegant-action-btn">REGÍSTRATE AHORA</button>
            </Link>
          </div>

          {/* Right Column: Reception Image */}
          <div className="nosotros-image-box">
            <img
              className="nosotros-portrait-img"
              src={`${process.env.PUBLIC_URL}/images/Beauty_Station_reception.jpeg`}
              alt="Beauty Station Reception"
            />
          </div>

        </div>

        {/* ── BOTTOM: Photo gallery grid ── */}
        <div className="nosotros-gallery-section">
          <div className="nosotros-gallery-grid">
            {GALLERY_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={img.alt}
                className="nosotros-gallery-img"
                onClick={() => openLightbox(i)}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="ns-lb-overlay" onClick={closeLightbox}>
          <button className="ns-lb-close" onClick={closeLightbox}>&#x2715;</button>
          <button className="ns-lb-arrow ns-lb-arrow--prev" onClick={(e) => { e.stopPropagation(); goPrev(); }}>&#8249;</button>
          <img
            className="ns-lb-img"
            src={GALLERY_IMAGES[lightboxIndex].src}
            alt={GALLERY_IMAGES[lightboxIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="ns-lb-arrow ns-lb-arrow--next" onClick={(e) => { e.stopPropagation(); goNext(); }}>&#8250;</button>
          <p className="ns-lb-counter">{lightboxIndex + 1} / {GALLERY_IMAGES.length}</p>
        </div>
      )}
    </>
  );
};

export default BeautySContacto;

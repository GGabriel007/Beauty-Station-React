// src/pages/Portafolio.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/portafolio.css';

const BODAS_GALLERY = [
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_1.jpg`,
    title: 'Boda 1',
    description: "Boda de 'Rana Oh' en Antigua Guatemala",
    instagramUrl: 'https://www.instagram.com/p/DSYomdUEVXC/?img_index=1',
  },
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_2.jpg`,
    title: 'Boda 2',
    description: "Boda de 'Anna Rittmeyer & Nico Rittmeyer' en Antigua Guatemala",
    instagramUrl: 'https://www.instagram.com/p/CrMW83suXcy/',
  },
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_3.jpg`,
    title: 'Boda 3',
    description: "Boda de 'Anna Rittmeyer & Nico Rittmeyer' en Antigua Guatemala",
    instagramUrl: 'https://www.instagram.com/p/CsPT_wXu0T-/?img_index=2',
  },
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_4.jpg`,
    title: 'Boda 4',
    description: "Boda de 'Gracie Zevallos & Josh Zevallos'",
    instagramUrl: 'https://www.instagram.com/p/DI69a5vRbVlgN5JaI03ul2Pa_NzSw0LP7dKato0/?img_index=4',
  },
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_5.jpg`,
    title: 'Boda 5',
    description: "Boda de 'Anna Rittmeyer & Nico Rittmeyer' en Antigua Guatemala",
    instagramUrl: 'https://www.instagram.com/p/DGbNR5iyATq/?img_index=2',
  },
  {
    src: `${process.env.PUBLIC_URL}/images/portafolio_bodas_6.jpg`,
    title: 'Boda 6',
    description: "Boda de 'Gracie Zevallos & Josh Zevallos'",
    instagramUrl: 'https://www.instagram.com/p/DI69a5vRbVlgN5JaI03ul2Pa_NzSw0LP7dKato0/?img_index=4',
  },
];

const CURSOS_GALLERY = [
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_1.jpg`, title: 'Curso 1', description: 'Pieles perfectas', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/pieles-perfectas', linkLabel: 'VER CURSO' },
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_2.jpg`, title: 'Curso 2', description: 'Master en waves', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/master-waves', linkLabel: 'VER CURSO' },
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_3.jpg`, title: 'Curso 3', description: 'Maquillaje Social', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/maquillaje-social', linkLabel: 'VER CURSO' },
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_4.jpg`, title: 'Curso 4', description: 'Peinado para eventos', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/peinado-eventos', linkLabel: 'VER CURSO' },
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_5.jpg`, title: 'Curso 5', description: 'Maestría en novias y tendencias (Maquillaje)', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/maestria-novias-makeup', linkLabel: 'VER CURSO' },
  { src: `${process.env.PUBLIC_URL}/images/portafolio_cursos_6.jpg`, title: 'Curso 6', description: 'Maestría en novias y tendencias (Peinado)', instagramUrl: 'https://master.d121neu4gkwbak.amplifyapp.com/classes/course/maestria-novias', linkLabel: 'VER CURSO' },
];

const PortafolioSection = ({ title, bannerSrc, gallery }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`portafolio-section ${open ? 'portafolio-section--open' : ''}`}>
      <button
        className={`portafolio-banner ${open ? 'portafolio-banner--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${open ? 'Colapsar' : 'Expandir'} sección ${title}`}
      >
        <img className="portafolio-banner-img" src={bannerSrc} alt={title} />
        <div className="portafolio-banner-overlay">
          <div className="portafolio-title-row">
            <h2 className="portafolio-section-title">{title}</h2>
          </div>
        </div>
      </button>

      <div className={`portafolio-gallery-wrapper ${open ? 'portafolio-gallery-wrapper--open' : ''}`}>
        <div className="portafolio-gallery-inner">
          <div className="portafolio-gallery">
            {gallery.map((item, i) => (
              <div key={i} className="portafolio-card">
                <img src={item.src} alt={item.title} className="portafolio-card-img" loading="lazy" />
                <div className="portafolio-card-overlay">
                  {item.description && (
                    <p className="portafolio-card-desc">{item.description}</p>
                  )}
                  {item.instagramUrl && (
                    <a
                      href={item.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portafolio-card-link"
                      onClick={e => e.stopPropagation()}
                    >
                      {item.linkLabel || 'Ver en Instagram'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Portafolio = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="portafolio-page">
      <div className="portafolio-header">
        <h1 className="portafolio-title">PORTAFOLIO</h1>
        <p className="portafolio-subtitle">Selecciona una sección para ver nuestro trabajo</p>
      </div>

      <div className="portafolio-sections">
        <PortafolioSection
          title="BODAS"
          bannerSrc={`${process.env.PUBLIC_URL}/images/portafolio_bodas_banner.png`}
          gallery={BODAS_GALLERY}
        />
        <PortafolioSection
          title="CURSOS"
          bannerSrc={`${process.env.PUBLIC_URL}/images/portafolio_cursos_banner.jpg`}
          gallery={CURSOS_GALLERY}
        />
      </div>
    </div>
  );
};

export default Portafolio;

// src/pages/BeautySContacto.js
import React, { useEffect } from 'react';
import '../styles/beauty-SContacto.css';
import { useLocation, Link } from 'react-router-dom';

const BeautySContacto = () => {
  const location = useLocation();

  useEffect(() => {
      window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <div className="nosotros-page-container">

        {/* ── TOP: Staggered layout — image left, bio box right ── */}
        <div className="nosotros-staggered-layout">

          {/* Left Column: Portrait Image */}
          {/* Left Column: Bio content (overlapping box) */}
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

          {/* Right Column: Portrait image */}
          {/* Replace nosotros_main.jpg with your photo when ready */}
          <div className="nosotros-image-box">
            <img
              className="nosotros-portrait-img"
              src={`${process.env.PUBLIC_URL}/images/nosotros_main.jpg`}
              alt="Beauty Station team"
            />
          </div>

        </div>

        {/* ── BOTTOM: Photo gallery grid ── */}
        {/* Replace these paths with your photos when ready:       */}
        {/*   /images/nosotros_gal1.jpg  through  nosotros_gal9.jpg */}
        <div className="nosotros-gallery-section">
          <div className="nosotros-gallery-grid">
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal1.jpg`} alt="Beauty Station 1" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal2.jpg`} alt="Beauty Station 2" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal3.jpg`} alt="Beauty Station 3" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal4.jpg`} alt="Beauty Station 4" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal5.jpg`} alt="Beauty Station 5" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal6.jpg`} alt="Beauty Station 6" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal7.jpg`} alt="Beauty Station 7" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal8.jpg`} alt="Beauty Station 8" className="nosotros-gallery-img" />
            <img src={`${process.env.PUBLIC_URL}/images/nosotros_gal9.jpg`} alt="Beauty Station 9" className="nosotros-gallery-img" />
          </div>
        </div>

      </div>
    </>
  );
};

export default BeautySContacto;

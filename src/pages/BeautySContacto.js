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
        
        <div className="nosotros-split-layout">
          {/* Left Column: Portrait Image */}
          <div className="nosotros-image-column">
            <img 
              className="aleh-portrait-img" 
              src={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh-Second.jpeg`} 
              alt="Portrait of Aleh referencing beauty and brands"
            />
          </div>

          {/* Right Column: Bio Information */}
          <div className="nosotros-info-column">
            <h1 className="nosotros-elegant-title">BEAUTY STATION</h1>
            <p className="nosotros-elegant-bio">
              Aleh es una artista de cabello y maquillaje de lujo para novias y eventos, certificada internacionalmente, en Guatemala. Especializada en crear looks elegantes para bodas y ocasiones especiales. Ofrece cursos profesionales y talleres avanzados de arte de maquillaje.
            </p>
            
            <p className="nosotros-elegant-bio">
              La mejor opción para cabello y maquillaje en Guatemala, con más de 11 años de experiencia en la industria de la belleza nupcial. Nuestro equipo ha sido capacitado con técnicas internacionales por nuestra MUA senior y peluquera Aleh, quien ha viajado por todo el mundo para aprender de los mejores expertos.
            </p>
            
            <Link to="/classes" className="nosotros-button-link">
              <button className="elegant-action-btn">REGÍSTRATE AHORA</button>
            </Link>
          </div>
        </div>

      </div> 
    </>
  );
};

export default BeautySContacto;
// src/pages/BeautySClasses.js
import React, { useEffect } from 'react';
import '../styles/beauty-SClasses.css';
import { Link, useLocation } from 'react-router-dom';

const BeautySClasses = () => {

    const location = useLocation();

    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

  return (
    <>
      <div className="information-module">
        <div className="top-information-classes">
            <h2 className="header-information-classes">CURSOS</h2>
        </div>

        <div className='image-container-classes'>
        <div className = "top-imagen-classes">
        <img className = "background-imagen-classes" src ={`${process.env.PUBLIC_URL}/images/background.jpeg`} alt ="imagen of the salon"/>
        <div className="overlay-classes"></div>

        </div>

        <div className="mid-information-classes">
          <Link to="/classes/classes-2" className="center-classes">
            <div className="glass-card-image-wrap">
              <img className="icon-classes" src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Mkup.jpeg`} alt="Informacion de Cursos"/>
            </div>
            <div className="title_links-cursos">MAQUILLAJE</div>
          </Link>
          <Link to="/classes/classes-1" className="center-classes">
            <div className="glass-card-image-wrap">
              <img className="icon-classes" src={`${process.env.PUBLIC_URL}/images/Class_1/imagen_Module_Hair.jpeg`} alt="Informacion de Cursos"/>
            </div>
            <div className="title_links-cursos">PEINADO</div>
          </Link>
        </div>
    </div>
    </div>
    </>
  );
};

export default BeautySClasses;
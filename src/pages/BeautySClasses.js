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
      <div className="information-classes">
        <div className="top-information-classes">
            <h2 className="header-information-classes">CURSOS</h2>
        </div>
        <div className="mid-information-classes">
            <div className="center-classes">
                <Link to = "/classes/classes-1">
                    <img className="icon-classes" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-classes">
                    <Link to = "/classes/classes-1">
                        <p className = "class_links-classes">Cursos Profesionales de Peinado</p>
                    </Link>
                    <p>Este curso de peinado profesional resume tips, materiales y técnicas actuales. No necesitas experiencia previa. Adquirirás conocimientos y herramientas para emprender. Las clases son prácticas y efectivas. Necesitarás cabezote y otros materiales; se dará asesoría.</p>
                </div>
            </div>
            <div className="center-classes">
                <Link to = "/classes/classes-2">
                    <img className="icon-classes" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-classes">
                        <Link to = "/classes/classes-2">
                        <p className = "class_links-classes">Cursos Profesionales de Maquillaje</p>
                        </Link>
                    <p>Nuestro curso de maquillaje profesional tiene 3 módulos especializados en maquillaje social con tips, materiales y técnicas actuales. No necesitas experiencia previa. Obtendrás conocimientos, herramientas y certificación, junto con nuestro book "The Makeup Guide".</p>
            </div>
        </div>
    </div>
    </div>
    </>
  );
};

export default BeautySClasses;
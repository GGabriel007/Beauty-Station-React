// src/pages/Classes_2.js
import React from 'react';
import '../styles/classes.css';
import { Link } from 'react-router-dom';

const Classes2 = () => {
    return (
        <>
            <div className="information-class">
        <div className="top-information-class">
            <h2 className="header-information-class"><strong>Clases de Maquillaje 2024</strong></h2>
        </div>

        <div className="mid-information-class">
            
            <div className="center-class">
                    <Link to = "/classes/classes-2/Module_1Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-2/Module_1Mkup">
                        <p className = "class_links-class">Pieles Perfectas</p>
                    </Link>
                    <p>Aprende desde cero a realizar pieles con diferentes acabados y coberturas. Skin care, Teoría del color y correcciones. Enseñaremos también diseño de cejas.</p>
                    <p>Nivel: Principiante/Intermedio</p>
                </div>
            </div>
            <div className="center-class">
                    <Link to = "/classes/classes-2/Module_2Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-2/Module_2Mkup">
                        <p className = "class_links-class">Maquillaje Social</p>
                    </Link>
                    <p>Realza la belleza de tus clientes con diferentes técnicas de maquillaje para todo tipo de evento social.</p>
                    <p>Nivel: Intermedio</p>
                </div>  
            </div>
            <div className="center-class">
                    <Link to = "/classes/classes-2/Module_3Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-2/Module_3Mkup">
                        <p className = "class_links-class">Maestria en Novias y Tendencias</p>
                    </Link>
                    <p>Ideal para actualizarte en tendencias internacionales, ALEH compartirá los tips y productos utilizados por los maquillistas de celebridades para impactar a tus clientes y resaltar tu perfil en redes sociales.</p>
                    <p>Nivel: Avanzado/Actualización</p>
                </div>  
            </div>
            <div className="center-class">
                    <Link to = "/classes/classes-2/Module_4Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-2/Module_4Mkup">
                        <p className = "class_links-class">Curso Completo Maquillaje</p>
                    </Link>
                    <p>Incluye: 3 módulos, Book "The Makeup Guide" y certificado enmarcado</p>
                </div>  
            </div>
        </div>
    </div>
        </>
    );
};

export default Classes2;
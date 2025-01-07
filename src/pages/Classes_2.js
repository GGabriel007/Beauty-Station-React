// src/pages/Classes_2.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';

const Classes2 = () => {

    const location = useLocation();
    
    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

    return (
        <>
            <div className="information-class">
        <div className="top-information-class">
            <h2 className="header-information-class">CURSOS DE MAQUILLAJE 2025</h2>
        </div>

        <div className="mid-information-module">
            
        <div className='space-class'></div>
        <Link  to = "/classes/classes-2/Module_1Mkup">

            <div className="center-class">
                    <Link className = 'imagen-link' to = "/classes/classes-2/Module_1Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                        <p className = "class_links-class">Pieles Perfectas</p>
                    
                    <div className='description-class'>
                    <p>Nivel: Principiante/Intermedio</p>
                    <p>Incluye certificado</p>
                    </div>
                </div>
            </div>
            </Link>
            <div className='space-class'></div>
            <div className='space-class'></div>
            <Link to = "/classes/classes-2/Module_2Mkup">
            <div className="center-class">
                    <Link className = 'imagen-link' to = "/classes/classes-2/Module_2Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Maquillaje Social</p>
                    
                    <div className='description-class'>
                    <p>Nivel: Intermedio</p>
                    <p>Incluye certificado</p>
                    </div>
                </div>  
            </div>
            </Link>
            <div className='space-class'></div>
            <div className='space-class'></div>
            <Link to = "/classes/classes-2/Module_3Mkup">
            <div className="center-class">
                    <Link className = 'imagen-link' to = "/classes/classes-2/Module_3Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Maestría en Novias y Tendencias</p>
                    
                    <div className='description-class'>
                    <p>Nivel: Avanzado/Actualización</p>
                    <p>Incluye certificado</p>
                    </div>
                </div>  
            </div>
            </Link>
            <div className='space-class'></div>
            <div className='space-class'></div>
            <Link  to = "/classes/classes-2/Module_4Mkup">
            <div className="center-class">
                    <Link className = 'imagen-link'to = "/classes/classes-2/Module_4Mkup">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Curso Completo</p>
                    
                        <div className='description-class-complete'>
                    <p className='Complete-text'>Incluye:</p>
                    <ul className='Complete-text'>
                        <li>3 módulos</li>
                        <li>Book “The makeup guide”</li>
                        <li>Certificado enmarcado</li>
                    </ul>
                    </div>
                </div>  
            </div>
            </Link>
            <div className='space-class'></div>
        </div>
    </div>
        </>
    );
};

export default Classes2;
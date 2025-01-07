// src/pages/Classes_1.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';


const Classes1 = () => {

    const location = useLocation();
    
    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

    return (
        <>
            <div className="information-class">
        <div className="top-information-class">
            <h2 className="header-information-class">CURSOS DE PEINADO 2025</h2>
        </div>

        <div className="mid-information-module">
            
        <div className='space-class'></div>
        <Link  to = "/classes/classes-1/Module_1Hair">
            <div className="center-class">
                <Link className = 'imagen-link' to = "/classes/classes-1/Module_1Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Master en Waves</p>
                    
                    <div className='description-class'>
                    <p>Nivel: Principiante/Intermedio</p>
                    <p>Incluye certificado</p>
                    </div>
                </div>
            </div>
            </Link>
            <div className='space-class'></div>
            <div className='space-class'></div>
            <Link  to = "/classes/classes-1/Module_2Hair">
            <div className="center-class">
                <Link className = 'imagen-link' to = "/classes/classes-1/Module_2Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Peinado para Eventos</p>
                        
                    <div className='description-class'>
                    <p>Nivel: Intermedio</p>
                    <p>Incluye certificado</p>
                    </div>
                </div>  
            </div>
            </Link>
            <div className='space-class'></div>
            <div className='space-class'></div>
            <Link to = "/classes/classes-1/Module_3Hair">
            <div className="center-class">
                    <Link className = 'imagen-link' to = "/classes/classes-1/Module_3Hair">
                    <img className ="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
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
            <Link  to = "/classes/classes-1/Module_4Hair">
            <div className="center-class">
                <Link className = 'imagen-link' to = "/classes/classes-1/Module_4Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    
                        <p className = "class_links-class">Curso Completo</p>
                        <div className='description-class-complete'>
                    <p className='Complete-text'>Incluye:</p>
                    <ul className='Complete-text'>
                        <li>3 módulos</li>
                        <li>Book “The hairstyle guide”</li>
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

export default Classes1;
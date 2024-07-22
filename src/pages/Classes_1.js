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
            <h2 className="header-information-class">CLASES DE PEINADO 2024</h2>
        </div>

        <div className="mid-information-class">
            
            <div className="center-class">
                <Link to = "/classes/classes-1/Module_1Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-1/Module_1Hair">
                        <p className = "class_links-class">Master en Waves</p>
                    </Link>
                    <div className='description-class'>
                    <p>El curso más vendido, ya que aprendes desde cero diferentes tipos de waves en tendencia, incluye las famosas retro waves.</p>
                    <p>Nivel: Principiante/Intermedio</p>
                    </div>
                </div>
            </div>
            <div className="center-class">
                <Link to = "/classes/classes-1/Module_2Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-1/Module_2Hair">
                        <p className = "class_links-class">Peinado para Eventos</p>
                        </Link>
                    <div className='description-class'>
                    <p>Realza la belleza de tus clientes con diferentes técnicas de peinados, aprende diferentes tipos de trenzas, coletas, recogidos y semi recogidos</p>
                    <p>Nivel: Intermedio</p>
                    </div>
                </div>  
            </div>
            <div className="center-class">
                    <Link to = "/classes/classes-1/Module_3Hair">
                    <img className ="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                    </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-1/Module_3Hair">
                        <p className = "class_links-class">Maestría en Novias y Tendencias</p>
                    </Link>
                    <div className='description-class'>
                    <p>Ideal para actualizarte en tendencias internacionales y peinado elaborado. ALEH compartirá los tips y productos para impactar a tus clientes y resaltar tu perfil en redes sociales.</p>
                    <p>Nivel: Avanzado/Actualización</p>
                    </div>
                </div>  
            </div>
            <div className="center-class">
                <Link to = "/classes/classes-1/Module_4Hair">
                    <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`} alt="Informacion de Cursos"/>
                </Link>
                <div className="text-class">
                    <Link to = "/classes/classes-1/Module_4Hair">
                        <p className = "class_links-class">Curso Completo Peinado</p>
                    </Link>
                    <div className='description-class'>
                    <p>Incluye: 3 módulos, Book "The Hairstyle guide" y certificado enmarcado.</p>
                    </div>
                </div>  
            </div>
        </div>
    </div>
        </>
    );
};

export default Classes1;
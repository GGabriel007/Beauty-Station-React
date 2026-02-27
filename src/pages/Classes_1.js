// src/pages/Classes_1.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';


const Classes1 = () => {

    const location = useLocation();

    useEffect(() => {

        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            <div className="information-class">
                <div className="top-information-class">
                    <h2 className="header-information-class">CURSOS DE PEINADO 2026</h2>
                </div>

                <div className="mid-information-module">

                    <div className='space-class'></div>
                    <Link to="/classes/course/master-waves-intensivo">
                        <div className="center-class">
                            <Link className='imagen-link' to="/classes/course/master-waves-intensivo">
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_Day/imagen_module_H.jpeg`} alt="Informacion de Cursos" />
                            </Link>
                            <div className="text-class">

                                <p className="class_links-class">Master en Waves Intensivo</p>

                                <div className='description-class'>
                                    <div className='one-day'>1 DÍA </div>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>BAJO CITA</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>

                    <Link to="/classes/course/master-waves">
                        <div className="center-class">
                            <Link className='imagen-link' to="/classes/course/master-waves">
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Hair.jpeg`} alt="Informacion de Cursos" />
                            </Link>
                            <div className="text-class">

                                <p className="class_links-class">Master en Waves</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>27 DE ENERO AL <br></br>
                                            17 DE FEBRERO</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>
                    <Link to="/classes/course/peinado-eventos">
                        <div className="center-class">
                            <Link className='imagen-link' to="/classes/course/peinado-eventos">
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`} alt="Informacion de Cursos" />
                            </Link>
                            <div className="text-class">

                                <p className="class_links-class">Peinado para Eventos</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>24 DE FEBRERO AL <br></br>
                                            7 DE ABRIL</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>
                    <Link to="/classes/course/maestria-novias">
                        <div className="center-class">
                            <Link className='imagen-link' to="/classes/course/maestria-novias">
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Hair.jpeg`} alt="Informacion de Cursos" />
                            </Link>
                            <div className="text-class">

                                <p className="class_links-class">Maestría en Novias y Tendencias</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>

                                        <span className='default-text'>15 DE ABRIL AL <br></br>
                                            7 DE MAYO</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>
                    <Link to="/classes/course/curso-completo-peinado">
                        <div className="center-class">
                            <Link className='imagen-link' to="/classes/course/curso-completo-peinado">
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`} alt="Informacion de Cursos" />
                            </Link>
                            <div className="text-class">

                                <p className="class_links-class">Curso Completo</p>
                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>27 DE ENERO AL <br></br>
                                            7 DE MAYO</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>

                                    </div>
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
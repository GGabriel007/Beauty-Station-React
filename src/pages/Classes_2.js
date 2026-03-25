// src/pages/Classes_2.js
import React, { useEffect } from 'react';
import '../styles/classes.css';
import { Link, useLocation } from 'react-router-dom';

const Classes2 = () => {

    const location = useLocation();

    useEffect(() => {

        window.scrollTo(0, 0);
    }, [location]);

    return (
        <>
            <div className="information-class">
                <div className="top-information-class">
                    <h2 className="header-information-class">CURSOS DE MAQUILLAJE 2026</h2>
                </div>

                <div className="mid-information-module">

                    <div className='space-class'></div>
                    <Link to="/classes/course/pieles-perfectas" style={{ textDecoration: 'none' }}>
                        <div className="center-class">
                            <div className='imagen-link'>
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos" />
                            </div>

                            <div className="text-class">

                                <p className="class_links-class">Pieles Perfectas</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>28 DE ENERO AL <br></br>
                                            25 DE FEBRERO</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>
                                    </div>
                                </div>
                            </div>



                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>
                    <Link to="/classes/course/maquillaje-social" style={{ textDecoration: 'none' }}>
                        <div className="center-class">
                            <div className='imagen-link'>
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos" />
                            </div>

                            <div className="text-class">

                                <p className="class_links-class">Maquillaje Social</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>4 DE MARZO AL <br></br>
                                            8 DE ABRIL</span>
                                        <span className='hover-text'>MÁS INFORMACIÓN</span>
                                    </div>
                                </div>
                            </div>



                        </div>
                    </Link>
                    <div className='space-class'></div>
                    <div className='space-class'></div>
                    <Link to="/classes/course/maestria-novias-makeup" style={{ textDecoration: 'none' }}>
                        <div className="center-class">
                            <div className='imagen-link'>
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos" />
                            </div>

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
                    <Link to="/classes/course/curso-completo-maquillaje" style={{ textDecoration: 'none' }}>
                        <div className="center-class">
                            <div className='imagen-link'>
                                <img className="icon-class" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`} alt="Informacion de Cursos" />
                            </div>

                            <div className="text-class">

                                <p className="class_links-class">Curso Completo Maquillaje</p>

                                <div className='description-class'>
                                    <div className='class_dates_button'>
                                        <span className='default-text'>28 DE ENERO AL <br></br>
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

export default Classes2;
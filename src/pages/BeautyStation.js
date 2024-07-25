// src/pages/BeautyStation.js
import React from 'react';
import '../styles/beauty-Station.css';
import { Link } from 'react-router-dom';

const BeautyStation = () => {
  return (
    <>
      <div className="information">
        <div className="top-information">
          <h2 className="header-information">HOME</h2>
        </div>
        <div className='image-container-home'>
        <div className = "top-imagen-home">
        <img className = "background-imagen-home" src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh2.jpeg`} alt ="imagen of the salon"/>
        <div className="overlay-home"></div>

        </div>
        <div className="mid-information">
          <div className="center">
          <Link to = "/classes">
              <img className="icon" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Hair.jpeg`} alt="Informacion de Cursos" />
          </Link>
          <Link to = "/classes" className='no-underline'>
            <p className="title_links-classes">CURSOS</p>
          </Link>
          </div>
          <div className="center">
          <Link to = "/servicio-a-domicilio" >
              <img className="icon" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Mkup.jpeg`} alt="Informacion de Cursos" />
          </Link>
          <Link to = "/servicio-a-domicilio" className='no-underline'>
            <p className="title_links-classes">EVENTOS</p>
          </Link>
          </div>
        </div>
        </div>
      </div>
      <div className="content">
      <p className="first-text"><b>¡Contáctanos!</b></p>
      
        <div className="waze">
          <div className="location-text">¡Directamente al Whatsapp! <div className='block-home'></div><a className="single-icon-home" href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A" target="_blank" rel="noopener noreferrer">
                <img className="icon-Social-media-home" src={`${process.env.PUBLIC_URL}/images/social_media/whatsapp.png`} alt="Whatsapp logo icons created by Pixel Perfect - Flaticon" />
            </a></div>
          </div>
        
        <p className="first-text"><b>Reseñas de Nuestros Clientes</b></p>
        <div className="waze">
          <div className="location-text">Estas son algunas de las opiniones y comentarios de quienes han confiado en nosotros para realzar su belleza.</div>
        </div>
        
      </div>
      <div className = "scrolling-wrapper-home">
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Sala2.jpeg`} alt = "Gallery Image Loby"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh2.jpeg`} alt = "Gallery Image Aleh 2"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_reception.jpeg`} alt = "Gallery Image Reception"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh.jpeg`} alt = "Gallery Image Aleh"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Sala.jpeg`} alt = "Gallery Image Loby"/>
            </div>
    </>
  );
};

export default BeautyStation;

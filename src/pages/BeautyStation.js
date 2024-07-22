// src/pages/BeautyStation.js
import React from 'react';
import '../styles/beauty-Station.css';
import { Link } from 'react-router-dom';

const BeautyStation = () => {
  return (
    <>
      <div className="information">
        <div className="top-information">
          <h2 className="header-information">CURSOS</h2>
        </div>
        <div className="mid-information">
          <div className="center">
          <Link to = "/classes/classes-1">
              <img className="icon" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Hair.jpeg`} alt="Informacion de Cursos" />
          </Link>
          <Link to = "/classes/classes-1" className='no-underline'>
            <p className="title_links-classes">PEINADO</p>
          </Link>
          </div>
          <div className="center">
          <Link to = "/classes/classes-2" >
              <img className="icon" src={`${process.env.PUBLIC_URL}images/Class_1/imagen_Module_Mkup.jpeg`} alt="Informacion de Cursos" />
          </Link>
          <Link to = "/classes/classes-2" className='no-underline'>
            <p className="title_links-classes">MAQUILLAJE</p>
          </Link>
          </div>
        </div>
      </div>
      <div className="content">
        <p className="first-text"><b>Encuentranos ubicados en la 20 Calle, zona 10, Cdad. de Guatemala, Guatemala</b></p>
        <div className="waze">
          <div className="location-text">¡También encuéntranos en Waze!</div>
          <div className="block"></div>
          <a href="https://www.waze.com/en/live-map/directions/beauty-station-nuevo-20-calle-la-plaza-20-cal-zona-10,-guatemala?place=w.176619666.1766262194.25981711">
            <img className="waze-logo" src={`${process.env.PUBLIC_URL}/images/social_media/waze.svg`} alt="Waze Logo" />
          </a>
        </div>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.371596291241!2d-90.49458159999999!3d14.5778894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a300389625b3%3A0x68e12c74df224866!2sBeauty%20Station!5e0!3m2!1sen!2sgt!4v1717607379678!5m2!1sen!2sgt"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default BeautyStation;

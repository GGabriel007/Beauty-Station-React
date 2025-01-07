// src/pages/BeautyStation.js
import React, {useState} from 'react';
import '../styles/beauty-Station.css';
import { Link } from 'react-router-dom';

const BeautyStation = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images = [
    `${process.env.PUBLIC_URL}/images/social_media/review3.jpeg`,
    `${process.env.PUBLIC_URL}/images/social_media/review2.jpeg`,
    `${process.env.PUBLIC_URL}/images/social_media/review1.jpeg`,
  ];


  const openModal = (src) => {
    setSelectedImage(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };


  return (
    <>
      <div className='all-content'>
      <div className="information">
        <div className='image-container-home'>
        <div className = "top-imagen-home">
        <img className = "background-imagen-home" src ={`${process.env.PUBLIC_URL}/images/background.jpeg`} alt ="imagen of the salon"/>
        <div className="overlay-home"></div>

        </div>
        <div className="mid-information">
          <div className="center">
          <Link to = "/classes">
              <img className="icon" src={`${process.env.PUBLIC_URL}images/cursos.png`} alt="Informacion de Cursos" />
          </Link>
          <Link to = "/classes" className='no-underline'>
            <p className="title_links-classes">CURSOS</p>
          </Link>
          </div>
          <div className="center">
          <Link to = "/servicio-a-domicilio" >
              <img className="icon" src={`${process.env.PUBLIC_URL}images/eventos.png`} alt="Informacion de Cursos" />
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
          <div className="location-text-contact ">¡Directamente al Whatsapp! <div className='block-home'></div><a className="single-icon-home" href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A" target="_blank" rel="noopener noreferrer">
                <img className="icon-Social-media-home" src={`${process.env.PUBLIC_URL}/images/social_media/whatsapp.png`} alt="Whatsapp logo icons created by Pixel Perfect - Flaticon" />
            </a></div>
          </div>
        
        <p className="first-text"><b>Reseñas de Nuestros Clientes</b></p>
        <div className="waze">
          <div className="location-text">Estas son algunas de las opiniones y comentarios de quienes han confiado en nosotros para realzar su belleza.</div>
        </div>
        
      </div>
      {/* Scrolling Gallery */}
      <div className="scrolling-wrapper-home">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Gallery Image ${index + 1}`}
            className="scrolling-image"
            onClick={() => openModal(src)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content">
            <img className="modal-image" src={selectedImage} alt="Expanded view" />
          </div>
        </div>
      )}
            </div>
    </>
  );
};

export default BeautyStation;

// src/pages/BeautySContacto.js
import React, { useEffect, useState } from 'react';
import '../styles/beauty-SContacto.css';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';


const BeautySContacto = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
    const images = [
      `${process.env.PUBLIC_URL}/images/Beauty_Station_Sala2.jpeg`,
      `${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh2.jpeg`,
      `${process.env.PUBLIC_URL}/images/Beauty_Station_reception.jpeg`,
      `${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh.jpeg`,
      `${process.env.PUBLIC_URL}/images/Beauty_Station_Sala.jpeg`,
    ];
  
  
    const openModal = (src) => {
      setSelectedImage(src);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedImage(null);
    };

  const location = useLocation();
    
  useEffect(() => {

      window.scrollTo(0,0);
  }, [location]);

  return (
    <>
      <div className="information-contact">
            <div className ="image-container-contact">
                <div className = "top-imagen-contact">
                <img className = "background-imagen-contact" src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Local.jpeg`} alt ="imagen of the salon"/>
                <div className="overlay-contact"></div>
              </div>
        

                <div className="centered-text-contact">
                    <p>ALEH</p>
                </div>
            </div>

            <div className = "about-text-contact">

               An internationally certified luxury bridal and event hair and makeup artist based in Guatemala, specializing in creating elegant looks for weddings and special occasions. Offers professional courses and marterclasses in makeup artistry. 

            {/* La mejor opción para cabello y maquillaje en Guatemala, con más de 11 años de experiencia en la industria de la belleza nupcial. Nuestro equipo ha sido capacitado con técnicas internacionales por nuestro MUA senior y peluquera Aleh, quien ha viajado por todo el mundo para aprender de los mejores expertos en Milán, Londres, Sao Paulo, Los Ángeles, Nueva York, Rusia y más, continuando siempre con la actualización de técnicas. Ofrecemos servicios presenciales para bodas de destino y eventos. Deja tu día especial en nuestras manos expertas.*/}
            </div>

            {/* Scrolling Gallery
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
      </div> */}

      {/* Modal 
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content">
            <img className="modal-image" src={selectedImage} alt="Expanded view" />
          </div>
        </div>
      )} */}

        <div className="second-center-image">
          <img className = "second-background-imagen-contact" src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh-Second.jpeg`} alt ="imagen of Aleh"/>
          <Link to="/classes"  className="button-link">
            <div className="second-center-button">
                  COMPRAR
            </div>
          </Link>

        </div>


      </div> 
    </>
  );
};

export default BeautySContacto;
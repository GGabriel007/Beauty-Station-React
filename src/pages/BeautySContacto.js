// src/pages/BeautySContacto.js
import React from 'react';
import '../styles/beauty-SContacto.css';

const BeautySContacto = () => {
  return (
    <>
      <div className="information-contact">
            <div className ="image-container-contact">
                <div className = "top-imagen-contact">
                <img className = "background-imagen-contact" src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Local.jpeg`} alt ="imagen of the salon"/>
                <div className="overlay-contact"></div>
              </div>
        

                <div className="centered-text-contact">
                    <p><strong>Sobre Nosotros</strong></p>
                </div>
            </div>

            <div className = "about-text-contact">
                
                La mejor opción para cabello y maquillaje en Guatemala, con más de 11 años de experiencia en la industria de la belleza nupcial. Nuestro equipo ha sido capacitado con técnicas internacionales por nuestro MUA senior y peluquera Aleh, quien ha viajado por todo el mundo para aprender de los mejores expertos en Milán, Londres, Sao Paulo, Los Ángeles, Nueva York, Rusia y más, continuando siempre con la actualización de técnicas. Ofrecemos servicios presenciales para bodas de destino y eventos. Deja tu día especial en nuestras manos expertas.
            </div>

            <div className = "scrolling-wrapper-contact">
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Sala2.jpeg`} alt = "Gallery Image Loby"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh2.jpeg`} alt = "Gallery Image Aleh 2"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_reception.jpeg`} alt = "Gallery Image Reception"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Aleh.jpeg`} alt = "Gallery Image Aleh"/>
                <img src ={`${process.env.PUBLIC_URL}/images/Beauty_Station_Sala.jpeg`} alt = "Gallery Image Loby"/>
            </div>
          </div> 
    </>
  );
};

export default BeautySContacto;
// src/pages/Module_1Hair.js
import React, { useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';



const Module_1Hair = () => {
  const { addToCart } = useContext(CartContext); // Get addToCart function from context
  const seatsAvailable = useContext(SeatContext); // Get seats data from context

  useEffect(() => {
    const thumbnails = document.querySelectorAll('.thumbnail-module');
    const selectedImage = document.getElementById('selectedImage-module');

    const handleThumbnailClick = (event) => {
      selectedImage.src = event.target.src;
    };

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', handleThumbnailClick);
    });

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      thumbnails.forEach(thumbnail => {
        thumbnail.removeEventListener('click', handleThumbnailClick);
      });
    };
    }, []);

  const handleAddToCart = () => {
    const moduleItem = {
      name: 'Module 1 Hair',
      price: 2000
    };
    addToCart(moduleItem);
  };

  return (
    <>
      <div className="information-module">
        <div className="top-information-module">
          <h2 className="header-information-module"><strong>Master Waves</strong></h2>
        </div>
        <div className="mid-information-module">
          <div className="gallery-module">
            <div className="main-image-module">
              <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos" />
            </div>
            <div className="thumbnails-module">
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 1" />
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 2" />
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 3" />
            </div>
          </div>
          <div className="text-module">
            <p className="class_links-module">Informacion del Módulo:</p>
            <p>El curso más vendido, ya que aprendes desde cero diferentes tipos de waves en tendencia, incluye las famosas retro waves.</p>
            <p>Nivel: Principiante/Intermedio</p>
            <p>Materiales: Plancha, tubo y cepillo; secadora y productos de cabello</p>
            <p className="class_links-module">Horarios:</p>
            <ul>
              <li>Clase 1: 23 de julio</li>
              <p>Introducción, productos y cómo hacer waves con plancha.</p>
              <li>Clase 2: 30 de julio</li>
              <p>Cómo lograr natural waves.</p>
              <li>Clase 3: 6 de agosto</li>
              <p>Técnicas para crear glam waves.</p>
              <li>Clase 4: 13 de agosto</li>
              <p>Estilo Old Hollywood waves y uso de velo.</p>
            </ul>
            <p className="class_links-module">Elige un Horario:</p>
            <ul>
              <li>Martes 2PM a 4PM</li>
              <li>Martes 6PM a 8PM</li>
            </ul>
            <p><b>Precio por persona:</b> Q2,000</p>
            <p><b>Inscripción:</b> Q500</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
            <p><b>Asientos disponibles:</b> {seatsAvailable[0]}</p> {/* Display the seats available */}
          </div>
          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos" />
          </div>
          <div className="text-module">
            <p><b>TÉRMINOS Y CONDICIONES</b></p>
            <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
          </div>
          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Module_1Hair;
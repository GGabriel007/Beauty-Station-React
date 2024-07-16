import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';

const Module_1Hair = () => {

  const location = useLocation();
    
    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

  const { cartItems, addToCart } = useContext(CartContext); // Get addToCart function from context
  const seatsAvailable = useContext(SeatContext); // Get seats data from context
  
  const [selectedSchedule, setSelectedSchedule] = useState('Clase 1'); // State for selected schedule
  const [availableSeats, setAvailableSeats] = useState(0); // State for available seats

  const [error, setError] = useState(''); // State for error messages

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

  useEffect(() => {
    // Updating available seats based on the selected schedule
    switch (selectedSchedule) {
      case 'Clase 1':
        setAvailableSeats(seatsAvailable[0] || 0); // Adjust index as needed
        break;
      case 'Clase 2':
        setAvailableSeats(seatsAvailable[1] || 0); // Adjust index as needed
        break;
      default:
        setAvailableSeats(0);
    }
  }, [selectedSchedule, seatsAvailable]);

  const handleAddToCart = () => {
    // Calculating the total seats in the cart for the selected schedule
    const seatsInCart = cartItems.reduce((count, item) => {
      return item.schedule === selectedSchedule ? count + 1: count; 
    }, 0);

    if (availableSeats - seatsInCart  <= 0){
      setError('No hay más asientos disponibles para esta clase.');
      return;
    }

      let moduleName = 'Master Waves 2PM a 4PM';
      if (selectedSchedule === 'Clase 2') moduleName = 'Master Waves 6PM a 8PM';
      const moduleItem = {
        name: moduleName,
        price: 2000,
        schedule: selectedSchedule
      };
      addToCart(moduleItem);
      setError('');
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
              <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos" />
            </div>
            <div className="thumbnails-module">
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 1" />
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 1" />
              <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 1" />
            </div>
          </div>
          <div className="text-module">
            <p className="class_links-module">Informacion del Módulo:</p>
            <p>El curso más vendido, ya que aprendes desde cero diferentes tipos de waves en tendencia, incluye las famosas retro waves.</p>
            <p>Nivel: Principiante/Intermedio</p>
            <p>Materiales: Plancha, tubo y cepillo; secadora y productos de cabello</p>
            <p className="class_links-module">Clases:</p>
            <ul>
              <li>Clase 1: 23 de julio - Introducción, productos y cómo hacer waves con plancha.</li>
              <li>Clase 2: 30 de julio - Cómo lograr natural waves.</li>
              <li>Clase 3: 6 de agosto - Técnicas para crear glam waves.</li>
              <li>Clase 4: 13 de agosto - Estilo Old Hollywood waves y uso de velo.</li>
            </ul>
            <p className="class_links-module">Horario:</p>
            <ul>
              <li>Martes 2PM a 4PM</li>
              <li>Martes 6PM a 8PM</li>
            </ul>
            <p><b>Precio por persona:</b> Q2,000</p>
            <p><b>Inscripción:</b> Q500</p>
            <p className="class_links-module">Selecciona una Clase:</p>
            <ul className='button-schedule'>
              <li>
                <input type="radio" id="clase1" name="schedule" value="Clase 1" checked={selectedSchedule === 'Clase 1'} onChange={() => setSelectedSchedule('Clase 1')} />
                <label htmlFor="clase1">Martes 2PM a 4PM</label>
              </li>
              <li>
                <input type="radio" id="clase2" name="schedule" value="Clase 2" checked={selectedSchedule === 'Clase 2'} onChange={() => setSelectedSchedule('Clase 2')} />
                <label htmlFor="clase2">Martes 6PM a 8PM</label>
              </li>
            </ul>
            <button className="add-to-cart-button" onClick={handleAddToCart}>Agendar Clase</button>
            <p><b>Asientos disponibles:</b> {availableSeats}</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos" />
          </div>
          <div className="text-module">
            <p><b>TÉRMINOS Y CONDICIONES</b></p>
            <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
          </div>
          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Module_1Hair;

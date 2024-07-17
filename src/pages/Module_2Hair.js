// src/pages/Module_2Hair.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';

const Module_2Hair = () => {

    const location = useLocation();
      
    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

    const { cartItems, addToCart } = useContext(CartContext); // Get addToCart function from context
    const seatsAvailable = useContext(SeatContext); // Get seats data from context

    const [selectedSchedule, setSelectedSchedule] = useState('Clase 1'); // State for selected schedule
    const [availableSeats, setAvailableSeats] = useState(0); // State for available seats

    const [error, setError] = useState(''); // State for error messages
    const [notification, setNotification] = useState('');

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
          setAvailableSeats(seatsAvailable[2] || 0); // Adjust index as needed
          break;
        case 'Clase 2':
          setAvailableSeats(seatsAvailable[3] || 0); // Adjust index as needed
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

      let moduleName = 'Peinados Para Eventos 2PM a 4PM';
      if (selectedSchedule === 'Clase 2') moduleName = 'Peinados Para Eventos 6PM a 8PM';

      // Validation for Peinado Para Eventos
      const hasPeinados = cartItems.some(item => 
        item.name === 'Peinados Para Eventos 2PM a 4PM' || item.name === 'Peinados Para Eventos 6PM a 8PM'  
      );

      if (hasPeinados && (moduleName === 'Peinados Para Eventos 2PM a 4PM' || moduleName === 'Peinados Para Eventos 6PM a 8PM')){
        setError('Solo puedes tener una de las clases "Peinados Para Eventos" en el carrito.');
        return;
      }

      // Validation for Curso Completo Peinado 
      const hasCursoCompleto = cartItems.some (item =>
        item.name === 'Curso Completo Peinado 2PM a 4PM' || item.name === 'Curso Completo Peinado 6PM a 8PM'
      );

      if (hasCursoCompleto) {
        setError('No puedes agregar otras clases de Peinado si tienes "Curso Completo Peinado" en el carrito.');
        return;
      }

      const moduleItem = {
        name: moduleName,
        price: 3500,
        image: `${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_Hair.jpeg`,
        schedule: selectedSchedule
      };
      addToCart(moduleItem);
      setError('');
      setNotification(`¡${moduleName} ha sido agregado al carrito!`);

    };

  return (
    <>
        <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module">Peinados Para Eventos</h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 2"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 2.1"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 2.2"/>
                </div>
            </div>
                <div className="text-module">
                    <p className="class_links-module">Informacion del Módulo:</p>
                    <p>Realza la belleza de tus clientes con diferentes técnicas de peinados, aprende diferentes tipos de trenzas, coletas, recogidos y semi recogidos</p>
                    <p>Nivel: Intermedio</p>
                    <p>Materiales: Kit completo de peinado.</p>
                    <p className="class_links-module">Clases:</p>
                    <ul>
                    <li>Clase 5: 20 de agosto - Trenzas en tendencias.</li>
                    <li>Clase 6: 27 de agosto - Semirecogido con extenciones.</li>
                    <li>Clase 7: 3 de septiembre - Cola baja.</li>
                    <li>Clase 8: 10 de septiembre - Sleek Bun</li>
                    <li>Clase 9: 17 de septiembre - Recogido clasico</li>
                    <li>Clase 10: 24 de septiembre - Recogido con volumen.</li>
                    <li>Clase 11: 1 de octubre - Evaluacion.</li>
                    </ul>
                    <p className="class_links-module">Horario:</p>
                    <ul>
                      <li>Martes 2PM a 4PM</li>
                      <li>Martes 6PM a 8PM</li>
                    </ul>
                    <p className="class_links-module">Precio por persona: Q3,500</p>
                    <p className="class_links-module">Inscripción: Q500</p>
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
                    <p className="class_links-module">Asientos disponibles: {availableSeats}</p>
                    {error && <p className="error-notification">{error}</p>}
                    {notification && <p className="notification">{notification}</p>}
                  </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
            <div className = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_2Hair;

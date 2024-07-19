// src/pages/Module_1Hair.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';

const Module_4Hair = () => {

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
          setAvailableSeats(seatsAvailable[6] || 0); // Adjust index as needed
          break;
        case 'Clase 2':
          setAvailableSeats(seatsAvailable[7] || 0); // Adjust index as needed
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
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      let moduleName = 'Curso Completo Peinado 2PM a 4PM';
      if (selectedSchedule === 'Clase 2') moduleName = 'Curso Completo Peinado 6PM a 8PM';

      // Validation for Curso Completo classes
      const hasCursoPeinado = cartItems.some(item =>
        item.name === 'Curso Completo Peinado 2PM a 4PM' || item.name === 'Curso Completo Peinado 6PM a 8PM'
      );

      if (hasCursoPeinado && (moduleName === 'Curso Completo Peinado 2PM a 4PM' || moduleName === 'Curso Completo Peinado 6PM a 8PM')) {
        setError('No puedes agregar el "Curso Completo Peinado" si tienes otra clase de Curso Completo Peinado en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Master Waves classes
      const hasMasterWaves = cartItems.some(item =>
        item.name === 'Master Waves 2PM a 4PM' || item.name === 'Master Waves 6PM a 8PM'
      );

      if (hasMasterWaves) {
        setError('No puedes agregar el "Curso Completo Peinado" si tienes otra clase de Peinado en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Peinados classes
      const hasPeinados = cartItems.some(item =>
        item.name === 'Peinados Para Eventos 2PM a 4PM' || item.name === 'Peinados Para Eventos 6PM a 8PM'
      );

      if (hasPeinados) {
        setError('No puedes agregar el "Curso Completo Peinado" si tienes otra clase de Peinado en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Maestria classes
      const hasMaestrias = cartItems.some(item =>
        item.name === 'Maestrías en Novias y Tendencias 2PM a 4PM' || item.name === 'Maestrías en Novias y Tendencias 6PM a 8PM'
      );

      if (hasMaestrias) {
        setError('No puedes agregar el "Curso Completo Peinado" si tienes otra clase de Peinado en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

  
      const moduleItem = {
        name: moduleName,
        price: 8500,
        image: `${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Hair.jpeg`,
        schedule: selectedSchedule
      };
      addToCart(moduleItem);
      setError('');
      setNotification(`¡${moduleName} ha sido agregado al carrito!`);

    };
  return (
    <>

        <div class="information-module">
        <div class="top-information-module">
            <h2 class="header-information-module">Curso Completo Peinado</h2>
        </div>
        <div class="mid-information-module">
            <div class="gallery-module">
                <div class="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 7"/> 
                       

                </div>
                <div class="thumbnails-module">
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 4"/>
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 4"/>
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 4"/>
                </div>
            </div>
            <div class="text-module">
                <p class="class_links-module">Informacion del Módulo:</p>
                <p>Este es un curso completo de peinado profesional, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa. Tendrás conocimientos y herramientas para poder emprender. Las clases son totalmente prácticas, por lo que el curso es un aprendizaje efectivo. Necesitarás cabezote y otros materiales; se dará asesoría como parte del curso. En algunas clases necesitarás modelo, bajo previo aviso. El curso se divide en 3 módulos.</p>
                <p>Incluye: 3 módulos, Book "The Hairstyle guide" y certificado enmarcado.</p>
                <p>Materiales: Plancha, tubo, cepillo, secadora, productos de cabello y Kit completo de peinado</p>
                <p class="class_links-module">Clases:</p>
                <ul>
                <li>Clase 1: 23 de julio - Introducción, productos y cómo hacer waves con plancha.</li>
                <li>Clase 2: 30 de julio - Cómo lograr natural waves.</li>
                <li>Clase 3: 6 de agosto - Técnicas para crear glam waves.</li>
                <li>Clase 4: 13 de agosto - Estilo Old Hollywood waves y uso de velo.</li>
                <li>Clase 5: 20 de agosto - Trenzas en tendencias.</li>
                <li>Clase 6: 27 de agosto - Semirecogido con extenciones.</li>
                <li>Clase 7: 3 de septiembre - Cola baja.</li>
                <li>Clase 8: 10 de septiembre - Sleek Bun</li>
                <li>Clase 9: 17 de septiembre - Recogido clasico</li>
                <li>Clase 10: 24 de septiembre - Recogido con volumen.</li>
                <li>Clase 11: 1 de octubre - Evaluacion.</li>
                <li>Clase 12: jueves 3 de octubre - Redes e ilumicaión en linea.</li>
                <li>Clase 13: martes 8 de octubre - Brindal Hair + List de cejas.</li>
                <li>Clase 14: jueves 10 de octubre - Practica en modelo.</li>
                <li>Clase 15: martes 15 de octubre - Peinado alto Kim Kardashian.</li>
                <li>Clase 16: jueves 17 de octubre - Practica Kim Kardashian.</li>
                <li>Clase 17: martes 22 de octubre - Peinado novia + colocación de velo.</li>
                <li>Clase 18: jueves 24 de octubre - Evaluación final, novias, entrega de portafolio.</li>

                </ul>
                <p class="class_links-module">Horario:</p>
                <ul>
                <li>Martes y Jueves 2PM a 4PM</li>
                <li>Martes y Jueves 6PM a 8PM</li>
                </ul>
                <p className="class_links-module">Precio por persona: Q8,500</p>
                <p className="class_links-module">Inscripción: Q500</p>
                <p className="class_links-module">Selecciona una Clase:</p>
                    <ul className='button-schedule'>
                      <li>
                        <input type="radio" id="clase1" name="schedule" value="Clase 1" checked={selectedSchedule === 'Clase 1'} onChange={() => setSelectedSchedule('Clase 1')} />
                        <label htmlFor="clase1">Martes y Jueves 2PM a 4PM</label>
                      </li>
                      <li>
                        <input type="radio" id="clase2" name="schedule" value="Clase 2" checked={selectedSchedule === 'Clase 2'} onChange={() => setSelectedSchedule('Clase 2')} />
                        <label htmlFor="clase2">Martes y Jueves 6PM a 8PM</label>
                      </li>
                    </ul>
                    <button className="add-to-cart-button" onClick={handleAddToCart}>Agendar Clase</button>
                    <p className="class_links-module">Asientos disponibles: {availableSeats}</p>
                    {error && <p className="error-notification">{error}</p>}
                    {notification && <p className="notification">{notification}</p>}
                  </div>
            <div class="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>
            <div class = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div class="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_4Hair;

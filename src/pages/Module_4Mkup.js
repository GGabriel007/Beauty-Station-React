// src/pages/Module_4Mkup.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';

const Module_4Mkup = () => {

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
    const [kitSelected, setKitSelected] = useState(false); //State for kit selection



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
            setAvailableSeats(seatsAvailable[14] || 0); // Adjust index as needed
            break;
          case 'Clase 2':
            setAvailableSeats(seatsAvailable[15] || 0); // Adjust index as needed
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
  

        let moduleName = 'Curso Completo Maquillaje 2PM a 4PM';
    
        if (selectedSchedule === 'Clase 2') moduleName = 'Curso Completo Maquillaje 6PM a 8PM';

        // Validation for Curso Completo classes
      const hasCursoPeinado = cartItems.some(item =>
        item.name === 'Curso Completo Maquillaje 2PM a 4PM' || item.name === 'Curso Completo Maquillaje 6PM a 8PM'
      );

      if (hasCursoPeinado && (moduleName === 'Curso Completo Maquillaje 2PM a 4PM' || moduleName === 'Curso Completo Maquillaje 6PM a 8PM')) {
        setError('No puedes agregar el "Curso Completo Maquillaje" si tienes otra clase de Maquillaje en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Pieles Perfectas
      const hasPieles = cartItems.some(item =>
        item.name === 'Pieles Perfectas 2PM a 4PM' || item.name === 'Pieles Perfectas 6PM a 8PM'
      );

      if (hasPieles) {
        setError('No puedes agregar el "Curso Completo Maquillaje" si tienes otra clase de Maquillaje en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Maquillaje Social classes
      const hasMaquillaje = cartItems.some(item =>
        item.name === 'Maquillaje Social 2PM a 4PM' || item.name === 'Maquillaje Social 6PM a 8PM'
      );

      if (hasMaquillaje) {
        setError('No puedes agregar el "Curso Completo Maquillaje" si tienes otra clase de Maquillaje en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      // Validation for Maestría en Novias y Tendencias classes
      const hasMaestrias = cartItems.some(item =>
        item.name === 'Maestría en Novias y Tendencias 2PM a 4PM' || item.name === 'Maestría en Novias y Tendencias 6PM a 8PM'
      );

      if (hasMaestrias) {
        setError('No puedes agregar el "Curso Completo Maquillaje" si tienes otra clase de Maquillaje en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }
    
        const moduleItem = {
          name: moduleName,
          price: 9000,
          image: `${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`,
          schedule: selectedSchedule,
          kitSelected: kitSelected

        };
        addToCart(moduleItem);
        setError('');
        setNotification(`¡${moduleName} ha sido agregado al carrito!`);

      };

  return (
    <>
        <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module">Curso Completo Maquillaje</h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_1Mkup.jpeg`} alt="Informacion de Curso 8"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_1Mkup.jpeg`} alt="Informacion de Curso 8"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_2Mkup.jpeg`} alt="Informacion de Curso 8"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_3Mkup.jpeg`} alt="Informacion de Curso 8"/>
                </div>
            </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Nuestro curso de maquillaje profesional consta de 3 módulos especializados en maquillaje social, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa. Con el curso completo tendrás conocimientos y herramientas para poder emprender.</p>
                <p>Incluye: 3 módulos, Book "The Makeup guide" y certificado enmarcado.</p>
                <p>Materiales: Kit de Maquillaje completo</p>                
                <p className="class_links-module">Clases:</p>
                <ul>
                <li>Clase 1: 24 de julio - Introducción y teoría.</li>
                <li>Clase 2: 31 de julio - Skincare, piel HD.</li>
                <li>Clase 3: 7 de agosto - Correcciones/Piel con acné full cobertura.</li>
                <li>Clase 4: 14 de agosto - Piel madura.</li>
                <li>Clase 5: 21 de agosto - Glowy skin, no makeup.</li>
                <li>Clase 6: 28 de agosto - Fotografía para redes y delineados.</li>
                <li>Clase 7: 4 de septiembre - Maquillaje de día express.</li>
                <li>Clase 8: 11 de septiembre - Glam con pigmentos quinceañera.</li>
                <li>Clase 9: 18 de septiembre - Técnica semi cut crease.</li>
                <li>Clase 10: 25 de septiembre - Técnica smokey latte makeup.</li>
                <li>Clase 11: 2 de octubre - Evaluacion.</li>
                <li>Clase 12: jueves 3 de octubre - Redes e iluminación en linea.</li>
                <li>Clase 13: miercoles 9 de octubre - Técnica Dafine hilos tensores.</li>
                <li>Clase 14: jueves 10 de octubre - Práctica Dafine.</li>
                <li>Clase 15: miercoles 16 de octubre - Técnica Pepe piel de Hada.</li>
                <li>Clase 16: jueves 17 de octubre - Práctica Pepe.</li>
                <li>Clase 17: miercoles 23 de octubre - Masterclass Técnica Airbrush.</li>
                <li>Clase 18: jueves 24 de octubre - Evaluación final novias, sesión de fotos y entrega de portafolio.</li>
                </ul>
                <p className="class_links-module">Horario:</p>
                <ul>
                <li>Miércoles y Jueves 2PM a 4PM</li>
                <li>Miércoles y Jueves 6PM a 8PM</li>
                </ul>
                <p className="class_links-module">Precio por persona: Q9,000</p>
                <p className="class_links-module">Inscripción: Q500</p>
                <p className="class_links-module">Precio de Kit de pieles perfectas (Altamente Recomendado): Q5,900</p>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={kitSelected} 
                    onChange={() => setKitSelected(!kitSelected)} 
                  />
                  Incluir Kit de pieles perfectas (Q5,900)
                </label>
                <p className="class_links-module">Selecciona una Clase:</p>
                  <ul className='button-schedule'>
                    <li>
                      <input type="radio" id="clase1" name="schedule" value="Clase 1" checked={selectedSchedule === 'Clase 1'} onChange={() => setSelectedSchedule('Clase 1')} />
                      <label htmlFor="clase1">Miercoles 2PM a 4PM</label>
                    </li>
                    <li>
                      <input type="radio" id="clase2" name="schedule" value="Clase 2" checked={selectedSchedule === 'Clase 2'} onChange={() => setSelectedSchedule('Clase 2')} />
                      <label htmlFor="clase2">Miercoles 6PM a 8PM</label>
                    </li>
                  </ul>
                  <button className="add-to-cart-button" onClick={handleAddToCart}>Agendar Clase</button>
                  <p className="class_links-module">Asientos disponibles: {availableSeats}</p>
                  {error && <p className="error-notification">{error}</p>}
                  {notification && <p className="notification">{notification}</p>}
                </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_2Mkup.jpeg`} alt="Informacion de Curso 8"/> 
            </div>
            <div className = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Mkup/imagen_module_3Mkup.jpeg`} alt="Informacion de Curso 8"/> 
            </div>
        </div>
    </div>

    </>
  );
};

export default Module_4Mkup;
 
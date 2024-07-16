// src/pages/Module_1Hair.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';

const Module_3Hair = () => {

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
            setAvailableSeats(seatsAvailable[4] || 0); // Adjust index as needed
            break;
          case 'Clase 2':
            setAvailableSeats(seatsAvailable[5] || 0); // Adjust index as needed
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
  
        let moduleName = 'Maestrías en Novias y Tendencias 2PM a 4PM';
    
        if (selectedSchedule === 'Clase 2') moduleName = 'Maestrías en Novias y Tendencias 6PM a 8PM';
    
        const moduleItem = {
          name: moduleName,
          price: 4000,
          schedule: selectedSchedule
        };
        addToCart(moduleItem);
        setError('');
      };
  


  return (
    <>
        <div className="information-module">
        <div className = "line1-module">
        </div>
        <div className="top-information-module">
            <h2 className="header-information-module"><strong>Maestrías en Novias y Tendencias</strong></h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 3"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 3"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 3"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 3"/>
                </div>
            </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Ideal para actualizarte en tendencias internacionales y peinado elaborado. ALEH compartirá los tips y productos para impactar a tus clientes y resaltar tu perfil en redes sociales.</p>
                <p>Nivel: Avanzado/Actualización</p>
                <p>Materiales: Kit de peinado completo</p>
                <p className="class_links-module">Clases:</p>
                <ul>
                <li>Clase 12: jueves 3 de octubre - Redes e ilumicaión en linea.</li>
                <li>Clase 13: martes 8 de octubre - Brindal Hair + List de cejas.</li>
                <li>Clase 14: jueves 10 de octubre - Practica en modelo.</li>
                <li>Clase 15: martes 15 de octubre - Peinado alto Kim Kardashian.</li>
                <li>Clase 16: jueves 17 de octubre - Practica Kim Kardashian.</li>
                <li>Clase 17: martes 22 de octubre - Peinado novia + colocación de velo.</li>
                <li>Clase 18: jueves 24 de octubre - Evaluación final, novias, entrega de portafolio.</li>
                </ul>
                <p className="class_links-module">Horario:</p>
                <ul>
                <li>Martes y Jueves 2PM a 4PM</li>
                <li>Martes y Jueves 6PM a 8PM</li>
                </ul>
                <p><b>Precio por persona:</b> Q4,000</p>
                <p><b>Inscripción:</b> Q500</p>
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
                    <p><b>Asientos disponibles:</b> {availableSeats}</p>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </div>
                  <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
            <div className = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_3/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_3Hair;

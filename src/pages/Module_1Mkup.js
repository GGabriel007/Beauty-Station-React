// src/pages/Module_1Mkup.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';
import { db } from '../config/firestore'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const Module_1Mkup = () => {

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
    const [kitAvailability, setKitAvailability] = useState(0); // State for kit availability


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
            setAvailableSeats(seatsAvailable[8] || 0); // Adjust index as needed
            break;
          case 'Clase 2':
            setAvailableSeats(seatsAvailable[9] || 0); // Adjust index as needed
            break;
          default:
            setAvailableSeats(0);
        }
      }, [selectedSchedule, seatsAvailable]);

      useEffect(() => {
        const fetchKitAvailability = async () => {
          try {
              const kitRef = doc(db, "Modulos", "992U9kQfUcpxR0FpY9l4mDI"); // Document ID for the kit
              const kitSnap = await getDoc(kitRef);
              if (kitSnap.exists()) {
                  setKitAvailability(kitSnap.data()['Kit de pieles perfectas'] || 0);
              } else {
                  setKitAvailability(0);
              }
          } catch (error) {
              setKitAvailability(0);
          }
      };
    
        fetchKitAvailability();
      }, []);

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

        let moduleName = 'Pieles Perfectas 2PM a 4PM';
        if (selectedSchedule === 'Clase 2') moduleName = 'Pieles Perfectas 6PM a 8PM';

        // Validation for Pieles Perfectas
        const hasPieles = cartItems.some(item =>
          item.name === 'Pieles Perfectas 2PM a 4PM' || item.name === 'Pieles Perfectas 6PM a 8PM'
        );

        if (hasPieles && (moduleName === 'Pieles Perfectas 2PM a 4PM' || moduleName === 'Pieles Perfectas 6PM a 8PM')) {
          setError('Solo puedes tener una de las clases "Pieles Perfectas" en el carrito.');
          setTimeout(() => {
            setError('');
          }, 8000);
          return;
        }

        // Validation for Curso Completo Peinado
      const hasCursoCompleto = cartItems.some(item =>
        item.name === 'Curso Completo Maquillaje 2PM a 4PM' || item.name === 'Curso Completo Maquillaje 6PM a 8PM'
      );

      if (hasCursoCompleto) {
        setError('No puedes agregar otras clases de Maquillaje si tienes "Curso Completo Maquillaje" en el carrito.');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }


        // Check kit availability before adding to cart
        if (kitSelected && kitAvailability <= 0) {
          setError('No hay más kits disponibles para agregar al carrito.');
          setTimeout(() => {
              setError('');
          }, 8000);
          return;
      }


        const moduleItem = {
          name: moduleName,
          price: 3000,
          image: `${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Mkup.jpeg`,          
          schedule: selectedSchedule,
          kitSelected: kitSelected
        };

        addToCart(moduleItem);
        setError('');
        if (kitSelected) {
          setNotification(`¡${moduleName} ha sido agregado al carrito con el kit de pieles perfectas!`);
        } else {
        setNotification(`¡${moduleName} ha sido agregado al carrito!`);
        }
      };


    return (
    <>
       <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module">Pieles Perfectas</h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_1Mkup.jpeg`} alt="Informacion de Cursos 5"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_1Mkup.jpeg`} alt="Informacion de Cursos 5"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_2Mkup.jpeg`} alt="Informacion de Cursos 5"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_3Mkup.jpeg`} alt="Informacion de Cursos 5"/>
                </div>
            </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Aprende desde cero a realizar pieles con diferentes acabados y coberturas. Skin care, Teoría del color y correcciones. Enseñaremos también diseño de cejas.</p>
                <p>Nivel: Principiante/Intermedio</p>
                <p>Materiales: Kit de piel y cejas completo</p>
                <p className="class_links-module">Clases:</p>
                <ul>
                <li>Clase 1: 24 de julio - Introducción y teoría.</li>
                <li>Clase 2: 31 de julio - Skincare, piel HD.</li>
                <li>Clase 3: 7 de agosto - Correcciones/Piel con acné full cobertura.</li>
                <li>Clase 4: 14 de agosto - Piel madura.</li>
                <li>Clase 5: 21 de agosto - Glowy skin, no makeup.</li>
                </ul>
                <p className="class_links-module">Horario:</p>
                <ul>
                  <li>Miercoles 2PM a 4PM</li>
                  <li>Miercoles 6PM a 8PM</li>
                </ul>
                <p className="class_links-module">Precio por persona: Q3,000</p>
                <p className="class_links-module">Inscripción: Q500</p>
                <p className="class_links-module">Precio de Kit de pieles perfectas (Altamente Recomendado): Q5,900</p>
                <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={kitSelected} 
                                onChange={() => setKitSelected(!kitSelected)} 
                            />
                            Incluir Kit de pieles perfectas (Q5,900) (Kits disponibles: {kitAvailability})
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
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_2Mkup.jpeg`} alt="Informacion de Cursos 5"/> 
            </div>
            <div className = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Mkup/imagen_module_3Mkup.jpeg`} alt="Informacion de Cursos 5"/> 
            </div>
        </div>
    </div> 

    </>
  );
};

export default Module_1Mkup;
 
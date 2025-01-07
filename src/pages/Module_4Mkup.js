// src/pages/Module_4Mkup.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';
import { db } from '../config/firestore'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { Link } from 'react-router-dom';


const Module_4Mkup = () => {

    const location = useLocation();
      
    useEffect(() => {

        window.scrollTo(0,0);
    }, [location]);

    const { cartItems, addToCart, setIncludeKit } = useContext(CartContext); // Get addToCart and setIncludeKit functions from context
    const seatsAvailable = useContext(SeatContext); // Get seats data from context

    const [selectedSchedule, setSelectedSchedule] = useState('Clase 1'); // State for selected schedule
    const [availableSeats, setAvailableSeats] = useState(0); // State for available seats
  
    const [error, setError] = useState(''); // State for error messages
    const [notification, setNotification] = useState('');
    const [kitSelected, setKitSelected] = useState(false); //State for kit selection
    const [kitAvailability, setKitAvailability] = useState(0); // State for kit availability
    const [cartnotification, setcartNotification] = useState('');

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
  

        let moduleName = 'Curso Completo Maquillaje 2PM a 4PM';
    
        if (selectedSchedule === 'Clase 2') moduleName = 'Curso Completo Maquillaje 6PM a 8PM';

        // Validation for Curso Completo classes
      const hasCursoPeinado = cartItems.some(item =>
        item.name === 'Curso Completo Maquillaje 2PM a 4PM' || item.name === 'Curso Completo Maquillaje 6PM a 8PM'
      );

      if (hasCursoPeinado && (moduleName === 'Curso Completo Maquillaje 2PM a 4PM' || moduleName === 'Curso Completo Maquillaje 6PM a 8PM')) {
        setError('No puedes agregar el "Curso Completo Maquillaje" si tienes otra clase de Maquillaje en el carrito.');
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
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
          price: 9100,
          image: `${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_Mkup.jpeg`,
          schedule: selectedSchedule,
          kitSelected: kitSelected

        };
        addToCart(moduleItem);

        // If kit is selected, update the includeKit state in CartContext
        if (kitSelected) {
          setIncludeKit(true);
        }
        
        setError('');
        if (kitSelected) {
          setNotification(`¡${moduleName} ha sido agregado al carrito con el kit de pieles perfectas!`);
          setcartNotification('¡Haz click aquí para dirigirte al carrito!');

        } else {
        setNotification(`¡${moduleName} ha sido agregado al carrito!`);
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');

        }
      };

  return (
    <>
        <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module">CURSO COMPLETO</h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_1Mkup.jpeg`} alt="Informacion de Curso 8"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_1Mkup.jpeg`} alt="Informacion de Curso 8"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_2Mkup.jpeg`} alt="Informacion de Curso 8"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_3Mkup.jpeg`} alt="Informacion de Curso 8"/>
                </div>
            </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Nuestro curso de maquillaje profesional consta de 3 módulos especializados en maquillaje social, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa. Con el curso completo tendrás conocimientos y herramientas para poder emprender.</p>
                <p>Incluye: 3 módulos, Book "The Makeup guide" y certificado enmarcado.</p>
                <p>Materiales: Kit de Maquillaje completo</p>                
                <p className="class_links-module">Clases:</p>
                <ul>
                <li><strong>Clase 1:</strong> <em>29 de enero </em>- Introducción y teoría</li>
                <li><strong>Clase 2:</strong> <em>5 de febrero </em>- Skincare, piel HD</li>
                <li><strong>Clase 3:</strong> <em>12 de febrero </em>- Correcciones/Piel con acné full cobertura</li>
                <li><strong>Clase 4:</strong> <em>19 de febrero </em> - Piel madura</li>
                <li><strong>Clase 5:</strong> <em>26 de febrero </em> - Glowy skin, no makeup</li>
                <li> <strong>Clase 6: </strong><em>5 de marzo</em>- Delineados y pestañas</li>
                <li> <strong>Clase 7: </strong><em>12 de marzo</em> - Maquillaje de día express</li>
                <li> <strong>Clase 8: </strong><em>19 de marzo</em> - Glam con pgmentos quinceañera</li>
                <li> <strong>Clase 9: </strong><em>26 de marzo</em> - Técnica semi cut crease</li>
                <li> <strong>Clase 10:</strong><em>2 de abril</em> - Técnica smokey latte makeup</li>
                <li> <strong>Foxy eyes, redes e iluminación</strong><p> Masterclass:<em> Miércoles 9 de abril </em></p> Práctica:<em> Jueves de 10 abril </em></li>
                <li> <strong>SEMANA SANTA</strong> </li>
                <li> <strong>Celebrity Makeup, hilos tensores</strong><p> Masterclass:<em> Miércoles 23 de abril </em></p> Práctica:<em> Jueves de 24 abril </em></li>
                <li> <strong>Técnica airbrush</strong> <p> Masterclass:<em> Jueves 30 de abril </em></p> Práctica:<em> Martes 6 de mayo </em></li>
                <li> <strong>Brindal glam + demo peinado</strong> <p className='Wed-Class'>Masterclass:<em> Miércoles 7 de mayo 4 PM</em> </p> Evaluacion final:<em> Jueves 8 de mayo, entrega portafolio</em></li>
                </ul>
                <p className="class_links-module">Horario:</p>
                <ul>
                <li>Miércoles y Jueves 2PM a 4PM</li>
                <li>Miércoles y Jueves 6PM a 8PM</li>
                </ul>
                <p className="class_links-module">Precio por persona: Q9,100</p>
                <p className="class_links-module">Inscripción: Q200</p>
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
                  <Link to = "/cart">
            {cartnotification && <p className="cart-notification">{cartnotification}</p>}
            </Link>
                </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_2Mkup.jpeg`} alt="Informacion de Curso 8"/> 
            </div>
            <div className = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Makeup/imagen_module_3Mkup.jpeg`} alt="Informacion de Curso 8"/> 
            </div>
        </div>
    </div>

    </>
  );
};

export default Module_4Mkup;
 
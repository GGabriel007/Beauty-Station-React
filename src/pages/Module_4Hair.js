// src/pages/Module_1Hair.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';


const Module_4Hair = () => {

  const [selectedImage, setSelectedImage] = useState(
        `${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_1Hair.jpeg`
      );
    
    
    
      const [isModalOpen, setIsModalOpen] = useState(false);
    
    
      const thumbnails = [
        `${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_1Hair.jpeg`,
        `${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_2Hair.jpeg`,
        `${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_3Hair.jpeg`,
      ];
    
    
      const handleThumbnailClick = (src) => {
        setSelectedImage(src);
      };
    
    
      const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
      };

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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');

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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');

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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');

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
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');

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
      setcartNotification('¡Haz click aquí para dirigirte al carrito!');


    };
  return (
    <>

        <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module">CURSO COMPLETO</h2>
        </div>
        <div className="mid-information-module">
        <div className="gallery-module">
      {/* Main Image */}
      <div className="main-image-module" onClick={toggleModal}>
        <img
          id="selectedImage-module"
          src={selectedImage}
          alt="Selected Course Information"
        />
      </div>

      {/* Thumbnails */}
      <div className="thumbnails-module">
        {thumbnails.map((src, index) => (
          <img
            key={index}
            className={`thumbnail-module ${
              selectedImage === src ? "active-thumbnail" : ""
            }`}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => handleThumbnailClick(src)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal" onClick={toggleModal}>
          <div className="modal-content">
            <img className="modal-image" src={selectedImage} alt="Expanded view" />
          </div>
        </div>
      )}
    </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Este es un curso completo de peinado profesional, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa. Tendrás conocimientos y herramientas para poder emprender. Las clases son totalmente prácticas, por lo que el curso es un aprendizaje efectivo. Necesitarás cabezote y otros materiales; se dará asesoría como parte del curso. En algunas clases necesitarás modelo, bajo previo aviso. El curso se divide en 3 módulos.</p>
                <p>Incluye: 3 módulos, Book "The Hairstyle guide" y certificado enmarcado.</p>
                <p>Materiales Requeridos: Plancha, tubo, cepillo, secadora, productos de cabello y Kit completo de peinado</p>
                <p>Los precios no incluye materiales</p>

                <p className="Demo-text"><strong>*DEMO MAKEUP GRATIS</strong></p>


                <p className="class_links-module">Clases:</p>
                <ul>
                  <li><strong>Clase 1:</strong> <em>Martes 28 de enero</em> - Introducción, productos y cómo hacer waves con plancha</li>
                  <li><strong>Clase 2:</strong> <em>Martes 4 de febrero</em> - Natural waves</li>
                  <li><strong>Clase 3:</strong> <em>Martes 11 de febrero</em> - Glam waves</li>
                  <li><strong>Clase 4:</strong> <em>Martes 18 de febrero </em> - Old Hollywood waves + velo</li>
                  <li><strong>Clase 5:</strong> <em>Martes 25 de febrero </em>- Trenzas en tendencias</li>
                  <li><strong>Clase 6:</strong> <em>Martes 4 de marzo </em>- Semirecogido</li>
                  <li><strong>Clase 7:</strong> <em>Martes 11 de marzo </em>- Recogido clásico</li>
                  <li><strong>Clase 8:</strong> <em>Martes 18 de marzo </em>- Recogido con volumen</li>
                  <li><strong>Clase 9:</strong> <em>Martes 25 de marzo </em>- Cola Baja</li>
                  <li><strong>Clase 10:</strong> <em>Martes 1 de abril </em>- Sleek Bun</li>
                  <li><strong>Clase 11:</strong> <em>Martes 8 de abril</em> - Redes e ilumicaión bridal hair + lift de cejas + velo</li>
                  <li><strong>Clase 12:</strong> <em>Jueves 10 de abril</em> - Práctica en modelo</li>
                  <li><strong>SEMANA SANTA</strong> </li>
                  <li><strong>Clase 13:</strong> <em>Martes 22 de abril</em> - Semirecogido con ondas retro</li>
                  <li><strong>Clase 14:</strong> <em> Jueves 24 de abril</em> - Práctica en modelo</li>
                  <li><strong>Clase 15:</strong> <em> Martes 29 de abril</em> - Cola alta con volumen</li>
                  <li><strong>Clase 16:</strong> <em> Martes 6 de mayo</em> - Práctica modelo</li>
                  <li className="Wed-Class"><strong>Clase 17:</strong> <em> Miercoles 7 de mayo 4 PM</em> - Peinado alto Kim Kardashian</li>
                  <li><strong>Clase 18:</strong> <em> Jueves 8 de mayo</em> - Evaluación final, entrega de portafolio</li>
                </ul>
                <p className="class_links-module">Horario:</p>
                <ul>
                <li>Martes y Jueves 2PM a 4PM</li>
                <li>Martes y Jueves 6PM a 8PM</li>
                </ul>
                <p className="class_links-module">Precio por persona: Q8,500</p>
                <p className="class_links-module">Inscripción: Q200</p>
                <p className="class_links-module">Selecciona una Clase:</p>
                <p className="Wed-Class"> HASTA 6 CUOTAS SIN RECARGO</p>
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
                    <button className="add-to-cart-button" onClick={handleAddToCart}>Comprar Curso</button>
                    <p className="class_links-module">Asientos disponibles: {availableSeats}</p>
                    {error && <p className="error-notification">{error}</p>}
                    {notification && <p className="notification">{notification}</p>}
                    <Link to = "/cart">
            {cartnotification && <p className="cart-notification">{cartnotification}</p>}
            </Link>

                  </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>

            { /*
            <div className = "text-module">
                <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>

            */}
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_4Hair;
                            
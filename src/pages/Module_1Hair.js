import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useWhatsAppForm from '../hook/useWhatsAppForm';



const Module_1Hair = () => {

  // Using the hook with correct course name
  const courseName = "Master Waves";
   const { whatsappForm, notificationError, handleWhatsAppChange, handleWhatsAppSubmit } = useWhatsAppForm(courseName);


  const [selectedImage, setSelectedImage] = useState(
      `${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_1Hair.jpeg`
    );
  
  
  
    const [isModalOpen, setIsModalOpen] = useState(false);
  
  
    const thumbnails = [
      `${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_1Hair.jpeg`,
      `${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_2Hair.jpeg`,
      `${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_3Hair.jpeg`,
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
      setTimeout(() => {
        setError('');
      }, 8000);
      return;
    }

      let moduleName = 'Master Waves 2PM a 4PM';
      if (selectedSchedule === 'Clase 2') moduleName = 'Master Waves 6PM a 8PM';

      // Validation for Master Waves classes
      const hasMasterWaves = cartItems.some(item =>
        item.name === 'Master Waves 2PM a 4PM' || item.name === 'Master Waves 6PM a 8PM'
      );

      if (hasMasterWaves && (moduleName === 'Master Waves 2PM a 4PM' || moduleName === 'Master Waves 6PM a 8PM')) {
        setError('Solo puedes tener una de las clases "Master Waves" en el carrito.');
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
        
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }


      // Validation for Curso Completo Peinado
      const hasCursoCompleto = cartItems.some(item =>
        item.name === 'Curso Completo Peinado 2PM a 4PM' || item.name === 'Curso Completo Peinado 6PM a 8PM'
      );

      if (hasCursoCompleto) {
        setError('No puedes agregar otras clases de Peinado si tienes "Curso Completo Peinado" en el carrito.');
        setcartNotification('¡Haz click aquí para dirigirte al carrito!');
        setTimeout(() => {
          setError('');
        }, 8000);
        return;
      }

      const moduleItem = {
        name: moduleName,
        price: 2200,
        image: `${process.env.PUBLIC_URL}/images/Class_1/Module_1/imagen_module_Hair.jpeg`,
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
          <h2 className="header-information-module">MASTER EN WAVES</h2>
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
            <p>El curso más vendido, ya que aprendes desde cero diferentes tipos de waves en tendencia, incluye las famosas retro waves.</p>
            <p>Nivel: Principiante/Intermedio</p>
            <p>Materiales Requeridos: Plancha, tubo y cepillo; secadora y productos de cabello</p>
            <p>Los precios no incluye materiales</p>
            <p>29 DE JULIO - 19 DE AGOSTO</p>
            <p className="class_links-module">Clases:</p>
            <h3>IMPARTIDO POR NUESTRO TEAM DE PROFESIONALES</h3>
            <ul>
              <li><strong>Clase 1:</strong> <em>Martes 29 de Julio</em> - Introduccíon, productos waves con plancha</li>
              <li><strong>Clase 2:</strong> <em>Martes 5 de Agosto</em> - Natural waves</li>
              <li><strong>Clase 3:</strong> <em>Martes 12 de Agosto</em> - Glam waves</li>
              <li><strong>Clase 4:</strong> <em>Martes 19 de Agosto</em> - Old Hollywood waves + velo</li>
            </ul>
            
            <p className="class_links-module">Elige entre 2 horarios:</p>
            <ul>
              <li>Opción 1: 2PM </li>
              <li>Opción 2: 6PM </li>
            </ul>
            <p className="class_links-module">Precio por persona: Q2,200</p>
            <p className="class_links-module">Inscripción: Q200</p>
            <p className="class_links-module">*gratis hasta el 15 de Julio</p>
            <p className="Wed-Class"> HASTA 3 CUOTAS SIN RECARGO</p>

            {/* WhatsApp Quick Form */}
            <div className="whatsapp-form">
              <p className="title-form">Reserva tu asiento</p>



              <label className='form-label'>Nombre Completo:*</label>
              <input
                pattern="^[a-zA-Z\s]*$"
                type="text"
                value={whatsappForm.name}
                onChange={(e) => handleWhatsAppChange('name', e.target.value)}
                title="Sólo se permiten letras y espacios."
                required
              />

              <label className="form-label">Email:</label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={whatsappForm.email}
                onChange={(e) => handleWhatsAppChange('email', e.target.value)}
                title="Ingrese un correo electrónico válido."
                required
              />

              <label className='form-label'>Usuario de Instagram o Facebook:</label>
              <input
                type="text"
                value={whatsappForm.instagram}
                onChange={(e) => handleWhatsAppChange('instagram', e.target.value)}
                title="Sólo puede tener letras, números, puntos y guiones bajos."
                required
              />

              <label className='form-label'>Número de Identificación:<div className="second-Text">(DPI o número de Pasaporte)</div></label>
              <input
                type="tel"
                value={whatsappForm.dpi}
                onChange={(e) => handleWhatsAppChange('dpi', e.target.value)}
                title="Ingresar solamente números"
                pattern="\d+"
                required
              />

              <label className='form-label'>Número de Teléfono:*</label>
              <input
                type="tel"
                placeholder="XXXX-XXXX"
                value={whatsappForm.phone}
                onChange={(e) => handleWhatsAppChange('phone', e.target.value)}
                title='Ingrese solo números'
                required
              />

              {notificationError && (
                <p className="error-notification">{notificationError}</p>
              )}

              <button className='contact-button' type="button" onClick={handleWhatsAppSubmit}>
                Regístrate por WhatsApp
              </button>
            </div>


            { /*

            button para agregar al carrito
            
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
            <button className="add-to-cart-button" onClick={handleAddToCart}>Comprar Curso</button>
            <p className="class_links-module">Asientos disponibles: {availableSeats}</p>
            {error && <p className="error-notification">{error}</p>}
            {notification && <p className="notification">{notification}</p>}
            <Link to = "/cart">
            {cartnotification && <p className="cart-notification">{cartnotification}</p>}
            </Link>

            */}

          </div>
          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos" />
          </div>

          { /* 
          <div className="text-module">
            <p className="class_links-module">TÉRMINOS Y CONDICIONES</p>
            <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
          </div>
          */}

          <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_1/Hair/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Module_1Hair;

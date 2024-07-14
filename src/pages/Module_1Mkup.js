// src/pages/Module_1Mkup.js
import React, { useEffect, useContext, useState } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';

const Module_1Mkup = () => {
    const { addToCart } = useContext(CartContext); // Get addToCart function from context
    const seatsAvailable = useContext(SeatContext); // Get seats data from context

    const [selectedSchedule, setSelectedSchedule] = useState('Clase 1'); // State for selected schedule
    const [availableSeats, setAvailableSeats] = useState(0); // State for available seats
  
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
        let moduleName = 'ModuloMkup1';
    
        if (selectedSchedule === 'Clase 2') moduleName = 'ModuloMkup12';
    
        const moduleItem = {
          name: moduleName,
          price: 3000,
          schedule: selectedSchedule
        };
        addToCart(moduleItem);
      };


    return (
    <>
       <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module"><strong>Pieles Perfectas</strong></h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo1.jpeg`} alt="Informacion de Cursos 5"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo1.jpeg`} alt="Informacion de Cursos 5"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo2.jpeg`} alt="Informacion de Cursos 5"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo3.jpeg`} alt="Informacion de Cursos 5"/>
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
                <p><b>Precio por persona:</b> Q3,000</p>
                <p><b>Inscripción:</b> Q500</p>
                <p><b>Precio de Kit de pieles perfectas (Altamente Recomendado):</b> Q5,900</p>
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
            <p><b>Asientos disponibles:</b> {availableSeats}</p>
          </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/CursosInfo2.jpeg`} alt="Informacion de Cursos 5"/> 
            </div>
            <div className = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/CursosInfo3.jpeg`} alt="Informacion de Cursos 5"/> 
            </div>
        </div>
    </div> 

    </>
  );
};

export default Module_1Mkup;
 
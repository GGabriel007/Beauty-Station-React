// src/pages/Module_1Hair.js
import React, { useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { SeatContext } from '../context/SeatContext'; // Import SeatContext
import '../styles/modules.css';

const Module_4Hair = () => {

  const { addToCart } = useContext(CartContext); // Get addToCart function from context
  const seatsAvailable = useContext(SeatContext); // Get seats data from context

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

  const handleAddToCart = () => {
    const moduleItem = {
      name: 'Modulo 4 Hair',
      price: 8500
    };
    addToCart(moduleItem);
  };
  return (
    <>

        <div class="information-module">
        <div class="top-information-module">
            <h2 class="header-information-module"><strong>Curso Completo</strong></h2>
        </div>
        <div class="mid-information-module">
            <div class="gallery-module">
                <div class="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 7"/> 
                       

                </div>
                <div class="thumbnails-module">
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 4"/>
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos 4"/>
                    <img class="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos 4"/>
                </div>
            </div>
            <div class="text-module">
                <p class="class_links-module">Informacion del Módulo:</p>
                <p>Este es un curso completo de peinado profesional, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa. Tendrás conocimientos y herramientas para poder emprender. Las clases son totalmente prácticas, por lo que el curso es un aprendizaje efectivo. Necesitarás cabezote y otros materiales; se dará asesoría como parte del curso. En algunas clases necesitarás modelo, bajo previo aviso. El curso se divide en 3 módulos.</p>
                <p>Incluye: 3 módulos, Book "The Hairstyle guide" y certificado enmarcado.</p>
                <p>Materiales: Plancha, tubo, cepillo, secadora, productos de cabello y Kit completo de peinado</p>
                <p class="class_links-module">Horarios:</p>
                <ul>
                <li>Clase 1: 23 de julio</li>
                <p>Introducción, productos y cómo hacer waves con plancha.</p>
                <li>Clase 2: 30 de julio</li>
                <p>Cómo lograr natural waves.</p>
                <li>Clase 3: 6 de agosto</li>
                <p>Técnicas para crear glam waves.</p>
                <li>Clase 4: 13 de agosto</li>
                <p>Estilo Old Hollywood waves y uso de velo.</p>
                <li>Clase 5: 20 de agosto</li>
                <p>Trenzas en tendencias.</p>
                <li>Clase 6: 27 de agosto</li>
                <p>Semirecogido con extenciones.</p>
                <li>Clase 7: 3 de septiembre</li>
                <p>Cola baja.</p>
                <li>Clase 8: 10 de septiembre</li>
                <p>Sleek Bun</p>
                <li>Clase 9: 17 de septiembre</li>
                <p>Recogido clasico</p>
                <li>Clase 10: 24 de septiembre</li>
                <p>Recogido con volumen.</p>
                <li>Clase 11: 1 de octubre</li>
                <p>Evaluacion.</p>
                <li>Clase 12: jueves 3 de octubre</li>
                <p>Redes e ilumicaión en linea.</p>
                <li>Clase 13: martes 8 de octubre</li>
                <p>Brindal Hair + List de cejas.</p>
                <li>Clase 14: jueves 10 de octubre</li>
                <p>Practica en modelo.</p>
                <li>Clase 15: martes 15 de octubre</li>
                <p>Peinado alto Kim Kardashian.</p>
                <li>Clase 16: jueves 17 de octubre</li>
                <p>Practica Kim Kardashian.</p>
                <li>Clase 17: martes 22 de octubre</li>
                <p>Peinado novia + colocación de velo.</p>
                <li>Clase 18: jueves 24 de octubre</li>
                <p>Evaluación final, novias, entrega de portafolio.</p>
                </ul>
                <p class="class_links-module">Elige un Horario:</p>
                <ul>
                <li>Martes 2PM a 4PM</li>
                <li>Martes 6PM a 8PM</li>
                </ul>
                <p><b>Precio por persona:</b> Q8,500</p>
                <p><b>Inscripción:</b> Q500</p>
                <button onClick={handleAddToCart}>Add to Cart</button>
                <p><b>Asientos disponibles:</b> {seatsAvailable[6]}</p>
            </div>
            <div class="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_2Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>
            <div class = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div class="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_4/imagen_module_3Hair.jpeg`} alt="Informacion de Curso 4"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_4Hair;

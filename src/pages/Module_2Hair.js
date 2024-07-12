// src/pages/Module_2Hair.js
import React, { useEffect } from 'react';
import '../styles/modules.css';

const Module_2Hair = () => {

    useEffect(() => {
        const thumbnails = document.querySelectorAll('.thumbnail-module');
        const selectedImage = document.getElementById('selectedImage-module');
        
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                selectedImage.src = thumbnail.src;
            });
        });

        //Cleanup function to remove event listeners when the component unmounts
        return () => {
            thumbnails.forEach(thumbnail => {
                thumbnail.removeEventListener('click', () => {
                    selectedImage.src = thumbnail.src;
                });
            });
        };
    },   []);



  return (
    <>
        <div className="information-module">
        <div className="top-information-module">
            <h2 className="header-information-module"><strong>Peinados Para Eventos</strong></h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_1Hair.jpeg`} alt="Informacion de Cursos 1"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_2Hair.jpeg`}/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_3Hair.jpeg`}/>
                </div>
            </div>
                <div className="text-module">
                    <p className="class_links-module">Informacion del Módulo:</p>
                    <p>Realza la belleza de tus clientes con diferentes técnicas de peinados, aprende diferentes tipos de trenzas, coletas, recogidos y semi recogidos</p>
                    <p>Nivel: Intermedio</p>
                    <p>Materiales: Kit completo de peinado.</p>
                    <p className="class_links-module">Horarios:</p>
                    <ul>
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
                    </ul>
                    <p className="class_links-module">Elige un Horario:</p>
                    <ul>
                    <li>Martes 2PM a 4PM</li>
                    <li>Martes 6PM a 8PM</li>
                    </ul>
                    <p><b>Precio por persona:</b> Q3,500</p>
                    <p><b>Inscripción:</b> Q500</p>
                </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_2Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
            <div className = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/Class_1/Module_2/imagen_module_3Hair.jpeg`} alt="Informacion de Cursos"/> 
            </div>
        </div>
    </div>
    </>
  );
};

export default Module_2Hair;

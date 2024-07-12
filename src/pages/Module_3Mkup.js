// src/pages/Module_3Mkup.js
import React, { useEffect } from 'react';
import '../styles/modules.css';

const Module_3Mkup = () => {

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
            <h2 className="header-information-module"><strong>Maestría en Novias y Tendencias</strong></h2>
        </div>
        <div className="mid-information-module">
            <div className="gallery-module">
                <div className="main-image-module">
                    
                    <img id="selectedImage-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo1.jpeg`} alt="Informacion de Cursos"/> 
                       

                </div>
                <div className="thumbnails-module">
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo1.jpeg`} alt="Informacion de Cursos 1"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo2.jpeg`} alt="Informacion de Cursos 2"/>
                    <img className="thumbnail-module" src={`${process.env.PUBLIC_URL}/images/CursosInfo3.jpeg`} alt="Informacion de Cursos 3"/>
                </div>
            </div>
            <div className="text-module">
                <p className="class_links-module">Informacion del Módulo:</p>
                <p>Ideal para actualizarte en tendencias internacionales, ALEH compartirá los tips y productos utilizados por los maquillistas de celebridades para impactar a tus clientes y resaltar tu perfil en redes sociales.</p>
                <p>Nivel: Avanzado/Actualización</p>
                <p>Materiales: Kit de piel y cejas completo</p>
                <p className="class_links-module">Horarios:</p>
                <ul>
                <li>Clase 12: jueves 3 de octubre</li>
                <p>Redes e iluminación en linea.</p>
                <li>Clase 13: miercoles 9 de octubre</li>
                <p>Técnica Dafine hilos tensores.</p>
                <li>Clase 14: jueves 10 de octubre</li>
                <p>Práctica Dafine.</p>
                <li>Clase 15: miercoles 16 de octubre</li>
                <p>Técnica Pepe piel de Hada.</p>
                <li>Clase 16: jueves 17 de octubre</li>
                <p>Práctica Pepe.</p>
                <li>Clase 17: miercoles 23 de octubre</li>
                <p>Masterclass Técnica Airbrush.</p>
                <li>Clase 18: jueves 24 de octubre</li>
                <p>Evaluación final novias, sesión de fotos y entrega de portafolio.</p>
                </ul>
                <p className="class_links-module">Elige un Horario:</p>
                <ul>
                <li>Miércoles y Jueves 2PM a 4PM</li>
                <li>Miércoles y Jueves 6PM a 8PM</li>
                </ul>
                <p><b>Precio por persona:</b> Q4,000</p>
                <p><b>Inscripción:</b> Q500</p>
                <p><b>Precio de Kit de pieles perfectas (Altamente Recomendado):</b> Q5,900</p>
            </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/CursosInfo2.jpeg`} alt="Informacion de Cursos"/> 
            </div>
            <div className = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/CursosInfo3.jpeg`} alt="Informacion de Cursos"/> 
            </div>
        </div>
        </div>

    </>
  );
};

export default Module_3Mkup;
 
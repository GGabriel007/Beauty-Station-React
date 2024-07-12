// src/pages/Module_1Mkup.js
import React, { useEffect } from 'react';
import '../styles/modules.css';

const Module_1Mkup = () => {

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
            <h2 className="header-information-module"><strong>Pieles Perfectas</strong></h2>
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
                <p>Aprende desde cero a realizar pieles con diferentes acabados y coberturas. Skin care, Teoría del color y correcciones. Enseñaremos también diseño de cejas.</p>
                <p>Nivel: Principiante/Intermedio</p>
                <p>Materiales: Kit de piel y cejas completo</p>
                <p className="class_links-module">Horarios:</p>
                <ul>
                <li>Clase 1: 24 de julio</li>
                <p>Introducción y teoría.</p>
                <li>Clase 2: 31 de julio</li>
                <p>Skincare, piel HD.</p>
                <li>Clase 3: 7 de agosto</li>
                <p>Correcciones/Piel con acné full cobertura.</p>
                <li>Clase 4: 14 de agosto</li>
                <p>Piel madura.</p>
                <li>Clase 5: 21 de agosto</li>
                <p>Glowy skin, no makeup.</p>
                </ul>
                <p className="class_links-module">Elige un Horario:</p>
                <ul>
                <li>Miercoles 2PM a 4PM</li>
                <li>Miercoles 6PM a 8PM</li>
                </ul>
                <p><b>Precio por persona:</b> Q3,000</p>
                <p><b>Inscripción:</b> Q500</p>
                <p><b>Precio de Kit de pieles perfectas (Altamente Recomendado):</b> Q5,900</p>
            </div>
            <div className="second-image-module">
            <img src={`${process.env.PUBLIC_URL}/images/CursosInfo2.jpeg`}/> 
            </div>
            <div className = "text-module">
                <p><b>TÉRMINOS Y CONDICIONES</b></p>
                <p>*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos. La reposición de clases tiene un costo adicional y está sujeta a la disponibilidad del equipo. No se permiten acompañantes en clase, a menos que se solicite como modelo en días específicos. Es indispensable estar solvente para participar en las clases.</p>
            </div>
            <div className="second-image-module">
                <img src={`${process.env.PUBLIC_URL}/images/CursosInfo3.jpeg`}/> 
            </div>
        </div>
    </div> 

    </>
  );
};

export default Module_1Mkup;
 
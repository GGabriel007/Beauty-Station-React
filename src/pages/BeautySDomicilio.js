// src/pages/BeautySDomicilio.js
import React from 'react';
import '../styles/beauty-SDomicilio.css';

const BeautySDomicilio = () => {
  return (
    <>
      <div className="information-form">
        <div className="top-information-form">
            <h2 className="header-information-form">Solicitud Servicio a Domicilio</h2>
        </div>
        <div className="mid-information-form">
            <form action = "https://formspree.io/f/mpwazzwv" method = "post">
                <label for = "email">EMAIL:*</label>
                <input type = "email" id ="email" name = "email" required/> <br/>

                <label for ="name">NOMBRE Y APELLIDO:*</label>
                <input type ="text" id ="name" name ="name" required/><br/>

                <label for = "whatsapp">NUMERO DE WHATSAPP:*</label>
                <input type = "number" id ="whatsapp" name ="whatsapp" required/><br/>

                <label for="date">FECHA DEL EVENTO:*</label>
                <input type = "date" id="date" name="date" required/><br/>

                <label for = "address">DIRECCIÓN O NOMBRE DE HOTEL DONDE DESEAN ARREGLARSE*: <div className ="second-Text">- ESPECIFICAR CIUDAD O ANTIGUA - TOMA EN CUENTA QUE LOS PRECIOS VARIAN SEGÚN UBICACIÓN</div></label>
                <textarea id = "address" name = "address" required></textarea><br/>

                <label for = "services">CANTIDAD DE SERVICOS QUE DESEEN COTIZAR:*<div className ="second-Text"> (MINIMO DE 6 MAQUILLAJES Y 6 PEINADOS PARA APLICAR A DOMICILIO)</div></label>
                <input type ="text" id="services" name = "services" required/><br/>

                <label for ="time">A QUE HORA NECESITAN ESTAR LISTAS?* <div className ="second-Text">(TOMA EN CONSIDERACIÓN SI SU FOTÓGRAFO LES HARÁ FOTOS)</div></label>
                <input type = "time" id = "time" name = "time" required/><br/>

                <label for ="notes">ALGO MÁS QUE CONSIDERA IMPORTANTE COMPARTIR CON NOSOTROS:*</label>
                <textarea id = "notes" name = "notes" required></textarea>

                <input type = "submit" value = "Submit"/>
            </form>    
        </div>
    </div>
    </>
  );
};

export default BeautySDomicilio;
// src/pages/BeautySDomicilio.js
import React from 'react';
import '../styles/beauty-SDomicilio.css';

const BeautySDomicilio = () => {
  return (
    <>
      <div className="information-form">
        <div className="top-information-form">
            <h2 className="header-information-form">SOLICITUD SERVICIO A DOMICILIO</h2>
        </div>
        <div className="mid-information-form">
        <form action = "https://docs.google.com/forms/u/0/d/e/1FAIpQLScEDYWXQs7zn4kFG1GDCVsP9Xnq7dSpoKEP1fN1ikhiW2H5IQ/formResponse" method = "post">
                <label for = "email">EMAIL:*</label>
                <input type = "email" id ="email" name = "emailAddress" required/> <br/>

                <label for ="name">NOMBRE Y APELLIDO:*</label>
                <input type ="text" id ="name" name ="entry.289998864" required/><br/>

                <label for = "whatsapp">NUMERO DE WHATSAPP:*</label>
                <input type = "number" id ="whatsapp" name ="entry.1968968654" required/><br/>

                <label for="date">FECHA DEL EVENTO:*</label>
                <input type = "date" id="date" name="entry.1338661665" required/><br/>

                <label for = "address">DIRECCIÓN O NOMBRE DE HOTEL DONDE DESEAN ARREGLARSE*: <div class ="second-Text">- ESPECIFICAR CIUDAD O ANTIGUA - TOMA EN CUENTA QUE LOS PRECIOS VARIAN SEGÚN UBICACIÓN</div></label>
                <textarea id = "address" name = "entry.1332809338" required></textarea><br/>

                <label for = "services">CANTIDAD DE SERVICOS QUE DESEEN COTIZAR:*<div class ="second-Text"> (MINIMO DE 6 MAQUILLAJES Y 6 PEINADOS PARA APLICAR A DOMICILIO)</div></label>
                <input type ="text" id="services" name = "entry.1887509461" required/><br/>

                <label for ="time">A QUE HORA NECESITAN ESTAR LISTAS?* <div class ="second-Text">(TOMA EN CONSIDERACIÓN SI SU FOTÓGRAFO LES HARÁ FOTOS)</div></label>
                <input type = "time" id = "time" name = "entry.1411026003" required/><br/>

                <label for ="notes">ALGO MÁS QUE CONSIDERA IMPORTANTE COMPARTIR CON NOSOTROS:*</label>
                <textarea id = "notes" name = "entry.1489137981" required></textarea>

                <input type = "submit" value = "Submit"/>
          </form>
          </div>




      </div>
    </>
  );
};

export default BeautySDomicilio;
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

            {/* Embed Google Form */}
            <iframe 
            className='mid-information-form'
              src="https://docs.google.com/forms/d/e/1FAIpQLScEDYWXQs7zn4kFG1GDCVsP9Xnq7dSpoKEP1fN1ikhiW2H5IQ/viewform?embedded=true" 
              frameborder="0" 
              marginheight="0" 
              marginwidth="0"
              title="Solicitud Servicio a Domicilio">
              Loading…
            </iframe>

      </div>
    </>
  );
};

export default BeautySDomicilio;
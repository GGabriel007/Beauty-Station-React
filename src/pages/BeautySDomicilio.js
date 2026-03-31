// src/pages/BeautySDomicilio.js
import React, { useEffect, useState } from 'react';
import '../styles/beauty-SDomicilio.css';
import { useLocation } from 'react-router-dom';

const BeautySDomicilio = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [formData, setFormData] = useState({
    'emailAddress' : '',
    'entry.1602240111': '',
    'entry.1691432624': '',
    'entry.188611796': '',
    'entry.1681329108': '',
    'entry.1787041902': '',

  });

  const handleNameChange = (e) => {
    const { value } = e.target;
    const regex = /^[a-zA-Z\s]*$/; // Allow only letters and spaces
    if (regex.test(value)) {
      setFormData({ ...formData, 'entry.1602240111': value });
    }
  };

  const ALLOWED_CHARACTERS = /^[a-zA-Z0-9\s,.\-]*$/; // Letters, numbers, commas, periods, spaces, hyphens

  const handleGenericChange = (e, fieldName) => {
    const { value } = e.target;
    if (!ALLOWED_CHARACTERS.test(value)) {
      alert("Por favor solamente utilice, letras, números, comas, puntos y guiones.");
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'emailAddress': 
        formattedValue = value.replace(/[^a-zA-Z0-9.@_-]/g, '');
        break;
      case 'entry.1691432624':
        formattedValue = value.replace(/\D/g, ''); // Allow only digits
        break;
      default:
        break;
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  return (
    <>
      <div className="domicilio-page-container">
        
        {/* Top Split Overlapping Layout */}
        <div className="domicilio-staggered-layout">
          
          {/* Left Column: Portrait Image */}
          <div className="domicilio-image-box">
             <img 
               className="domicilio-portrait-img" 
               src={`${process.env.PUBLIC_URL}/images/domicilio_main.png`} 
               alt="Servicio a Domicilio" 
             />
          </div>

          {/* Right Column: Elegant Overlapping Form */}
          <div className="domicilio-form-box">
             <h2 className="domicilio-elegant-title">SOLICITUD SERVICIO A DOMICILIO</h2>
             <p className="domicilio-elegant-subtitle">Llenando este formulario podremos enviarte una cotización detallada de los servicios para ese día tan especial.</p>
             
             <form
                className="domicilio-elegant-form"
                action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfDpQjDORdbRwIzsQuBYMWpBLVcd-xo_Y8ouWpCPcD4Q1PW-g/formResponse"
                method="post"
              >
                <div className="form-group">
                  <label htmlFor="email" className="elegant-label">Email:*</label>
                  <input  
                      className="elegant-input"
                      type="email" 
                      id="email" 
                      name="emailAddress" 
                      placeholder="email@domain.com"
                      value={formData['emailAddress']}
                      onChange={handleChange}  
                      required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="elegant-label">Nombre Completo:*</label>
                  <input
                    className="elegant-input"
                    pattern="^[a-zA-Z\s]*$"
                    type="text"
                    id="name"
                    name="entry.1602240111"
                    value={formData['entry.1602240111']}
                    onChange={handleNameChange}
                    title="Sólo se permiten letras y espacios."
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp" className="elegant-label">Número de Whatsapp:*</label>
                  <input
                    className="elegant-input"
                    type="tel"
                    id="whatsapp"
                    name="entry.1691432624"
                    value={formData['entry.1691432624']}
                    onChange={handleChange}
                    placeholder="XXXX-XXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date" className="elegant-label">Fecha del Evento:*</label>
                  <input 
                    className="elegant-input"
                    type="date" 
                    id="date" 
                    name="entry.1686684049" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="elegant-label">
                    Dirección o Nombre de Hotel donde Desean Arreglarse*:
                    <span className="elegant-label-hint"> Especificar Ciudad o Antigua - Toma en Cuenta que los Precios Varían Según Ubicación</span>
                  </label>
                  <textarea
                    className="elegant-textarea"
                    id="address"
                    name="entry.188611796"
                    value={formData['entry.188611796']}
                    onChange={(e) => handleGenericChange(e, 'entry.188611796')}
                    rows="2"
                    placeholder="Ingresa la dirección detallada"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="services" className="elegant-label">
                  Cantidad de Servicios que Deseen Cotizar:*
                    <span className="elegant-label-hint"> (Mínimo de 6 Maquillajes y 6 Peinados para Aplicar a Domicilio)</span>
                  </label>
                  <input 
                   className="elegant-input"
                   type="text"
                   id="services" 
                   name="entry.1681329108" 
                   value={formData['entry.1681329108']}
                   onChange={(e) => handleGenericChange(e, 'entry.1681329108')}
                   placeholder="Ej. 1 novia, 5 invitadas"
                   required 
                   />
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="elegant-label">
                  ¿A qué Hora Necesitan Estar Listas?*
                    <span className="elegant-label-hint"> (Toma en Consideración si su Fotógrafo les Hará Fotos)</span>
                  </label>
                  <input 
                    className="elegant-input"
                    type="time" 
                    id="time" 
                    name="entry.574987156" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="elegant-label">Algo más que Considera Importante Compartir con Nosotros:*</label>
                  <textarea 
                    className="elegant-textarea"
                    id="text" 
                    name="entry.1787041902" 
                    value={formData['entry.1787041902']}
                    onChange={(e) => handleGenericChange(e, 'entry.1787041902')}
                    rows="3"
                    placeholder="Cualquier información extra"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="elegant-submit-btn">ENVIAR SOLICITUD</button>
             </form>
          </div>
        </div>

        {/* Bottom Section: Gallery Grid */}
        <div className="domicilio-gallery-section">
           <div className="domicilio-gallery-grid">
              {/* Newly Uploaded Bridal Images */}
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal1.jpg`} alt="Bridal Event Preview 1" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal2.jpg`} alt="Bridal Event Preview 2" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal3.jpg`} alt="Bridal Event Preview 3" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal4.jpg`} alt="Bridal Event Preview 4" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal5.jpg`} alt="Bridal Event Preview 5" className="gallery-img-item" />
              
              {/* Newly Uploaded Bridal Images (Set 2) */}
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal6.jpg`} alt="Bridal Event Preview 6" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal7.jpg`} alt="Bridal Event Preview 7" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal8.jpg`} alt="Bridal Event Preview 8" className="gallery-img-item" />
              <img src={`${process.env.PUBLIC_URL}/images/domicilio_gal9.jpg`} alt="Bridal Event Preview 9" className="gallery-img-item" />
           </div>
        </div>

      </div>
    </>
  );
};

export default BeautySDomicilio;

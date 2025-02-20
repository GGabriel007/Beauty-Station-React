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
    'entry.289998864': '',
    'entry.1968968654': '',
    'entry.1332809338': '',
    'entry.1887509461': '',
    'entry.1489137981': '',

  });

  const handleNameChange = (e) => {
    const { value } = e.target;
    const regex = /^[a-zA-Z\s]*$/; // Allow only letters and spaces
    if (regex.test(value)) {
      setFormData({ ...formData, 'entry.289998864': value });
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
        // Allow only valid email characters (letters, numbers, dots, hyphens, underscores, and @)
        formattedValue = value.replace(/[^a-zA-Z0-9.@_-]/g, '');
        break;
      case 'entry.1968968654':
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
      <div className="information-form">
        <div className="top-information-form">
          <h2 className="header-information-form">SOLICITUD SERVICIO A DOMICILIO</h2>
        </div>
        <div className="mid-information-form">
          <form
            action="https://docs.google.com/forms/u/0/d/e/1FAIpQLScEDYWXQs7zn4kFG1GDCVsP9Xnq7dSpoKEP1fN1ikhiW2H5IQ/formResponse"
            method="post"
          >
            <label htmlFor="email" className="form-label">Email:*</label>
              <input  
                  type="email" 
                  id="email" 
                  name="emailAddress" 
                  placeholder="email@domain.com"
                  value={formData['emailAddress']}
                  onChange={handleChange}  
                  required 
              />

            <label htmlFor="name">Nombre Completo:*</label>
            <input
              pattern="^[a-zA-Z\s]*$"
              type="text"
              id="name"
              name="entry.289998864"
              value={formData['entry.289998864']}
              onChange={handleNameChange}
              title="Sólo se permiten letras y espacios."
              required
            />

            <label htmlFor="whatsapp">Número de Whatsapp:*</label>
            <input
              type="tel"
              id="whatsapp"
              name="entry.1968968654"
              value={formData['entry.1968968654']}
              onChange={handleChange}
              placeholder="XXXX-XXXX"
              required
            /><br />

            <label htmlFor="date">Fecha del Evento:*</label>
            <input type="date" id="date" name="entry.1338661665" required /><br />

            <label htmlFor="address">
              Dirección o Nombre de Hotel donde Desean Arreglarse*:
              <div className="second-Text">
              - Especificar Ciudad o Antigua - Toma en Cuenta que los Precios Varían Según Ubicación
              </div>
            </label>
            <textarea
              id="address"
              name="entry.1332809338"
              value={formData['entry.1332809338']}
              onChange={(e) => handleGenericChange(e, 'entry.1332809338')}
              required
            ></textarea><br />

            <label htmlFor="services">
            Cantidad de Servicios que Deseen Cotizar:*
              <div className="second-Text">(Mínimo de 6 Maquillajes y 6 Peinados para Aplicar a Domicilio)</div>
            </label>
            <input 
             type="text"
             id="services" 
             name="entry.1887509461" 
             value={formData['entry.1887509461']}
             onChange={(e) => handleGenericChange(e, 'entry.1887509461')}
             required 
             /><br />

            <label htmlFor="time">
            ¿A qué Hora Necesitan Estar Listas?*
              <div className="second-Text">(Toma en Consideración si su Fotógrafo les Hará Fotos)</div>
            </label>
            <input type="time" id="time" name="entry.1411026003" required /><br />

            <label htmlFor="notes">Algo más que Considera Importante Compartir con Nosotros:*</label>
            <textarea 
            
            id="text" 
            name="entry.1489137981" 
            value={formData['entry.1489137981']}
            onChange={(e) => handleGenericChange(e, 'entry.1489137981')}
            required
            ></textarea>

            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    </>
  );
};

export default BeautySDomicilio;

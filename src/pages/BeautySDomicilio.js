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
        // Allow only valid email characters (letters, numbers, dots, hyphens, underscores, and @)
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
      <div className="information-form">
        <div className="top-information-form">
          <h2 className="header-information-form">SOLICITUD SERVICIO A DOMICILIO</h2>
        </div>
        <div className="mid-information-form">
          <form
            action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSfDpQjDORdbRwIzsQuBYMWpBLVcd-xo_Y8ouWpCPcD4Q1PW-g/formResponse"
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
              name="entry.1602240111"
              value={formData['entry.1602240111']}
              onChange={handleNameChange}
              title="Sólo se permiten letras y espacios."
              required
            />

            <label htmlFor="whatsapp">Número de Whatsapp:*</label>
            <input
              type="tel"
              id="whatsapp"
              name="entry.1691432624"
              value={formData['entry.1691432624']}
              onChange={handleChange}
              placeholder="XXXX-XXXX"
              required
            /><br />

            <label htmlFor="date">Fecha del Evento:*</label>
            <input type="date" id="date" name="entry.1686684049" required /><br />

            <label htmlFor="address">
              Dirección o Nombre de Hotel donde Desean Arreglarse*:
              <div className="second-Text">
              - Especificar Ciudad o Antigua - Toma en Cuenta que los Precios Varían Según Ubicación
              </div>
            </label>
            <textarea
              id="address"
              name="entry.188611796"
              value={formData['entry.188611796']}
              onChange={(e) => handleGenericChange(e, 'entry.188611796')}
              required
            ></textarea><br />

            <label htmlFor="services">
            Cantidad de Servicios que Deseen Cotizar:*
              <div className="second-Text">(Mínimo de 6 Maquillajes y 6 Peinados para Aplicar a Domicilio)</div>
            </label>
            <input 
             type="text"
             id="services" 
             name="entry.1681329108" 
             value={formData['entry.1681329108']}
             onChange={(e) => handleGenericChange(e, 'entry.1681329108')}
             required 
             /><br />

            <label htmlFor="time">
            ¿A qué Hora Necesitan Estar Listas?*
              <div className="second-Text">(Toma en Consideración si su Fotógrafo les Hará Fotos)</div>
            </label>
            <input type="time" id="time" name="entry.574987156" required /><br />

            <label htmlFor="notes">Algo más que Considera Importante Compartir con Nosotros:*</label>
            <textarea 
            
            id="text" 
            name="entry.1787041902" 
            value={formData['entry.1787041902']}
            onChange={(e) => handleGenericChange(e, 'entry.1787041902')}
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

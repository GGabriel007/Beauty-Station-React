import { useState } from 'react';
import DOMPurify from 'dompurify';

const useWhatsAppForm = (courseName = "este curso") => {
    const [whatsappForm, setWhatsAppForm] = useState({
        name: '',
        email: '',
        instagram: '',
        dpi: '',
        phone: ''
    });

    const [notificationError, setNotificationError] = useState('');

    const handleWhatsAppChange = (field, value) => {
        let formattedValue = value;

        switch (field) {
      case 'name':
        // Allow only letters and spaces
        formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      case 'email':
        // Allow valid email characters
        formattedValue = value.replace(/[^a-zA-Z0-9.@_-]/g, '');
        break;
      case 'instagram':
        // Instagram/FB username
        formattedValue = value.replace(/[^a-zA-Z0-9._]/g, '');
        break;
      case 'dpi':
        // Only digits
        formattedValue = value.replace(/\D/g, '');
        break;
      case 'phone':
        // Only digits
        formattedValue = value.replace(/\D/g, '').slice(0, 8); // Max 8 digits
        break;
      default:
        break;
    }

    setWhatsAppForm({
      ...whatsappForm,
      [field]: DOMPurify.sanitize(formattedValue)
    });
  };

  const handleWhatsAppSubmit = () => {
    const { name, email, instagram, dpi, phone } = whatsappForm;

    setNotificationError("");

    if (!name.trim()) {
      setNotificationError("¡Al menos necesitamos un nombre!");
      return;
    }

    if (!phone.trim()) {
      setNotificationError("¡Al menos necesitamos un número de teléfono!");
      return;
    }

    const businessWhatsAppNumber = "50251966818"; // Replace with your number
    const message = `
    Hola, quiero reservar mi asiento para el curso:

    Curso: ${courseName}
    Nombre: ${name}
    Email: ${email}
    Instagram/Facebook: ${instagram}
    ID (DPI/Pasaporte): ${dpi}
    Teléfono: ${phone}
    `.trim();

    const whatsappURL = `https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(decodeURIComponent(whatsappURL), '_blank');
    };

    return {
    whatsappForm,
    notificationError,
    handleWhatsAppChange,
    handleWhatsAppSubmit
  };
};

export default useWhatsAppForm;

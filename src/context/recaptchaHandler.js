export const showRecaptcha = (siteKey) => {
    return new Promise((resolve, reject) => {
      // Creates a dynamic container for the reCAPTCHA   
      const recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      document.body.appendChild(recaptchaContainer);
  
      // Loads the script for reCAPTCHA if is not load
      if (!document.querySelector(`script[src="https://www.google.com/recaptcha/api.js"]`)) {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
  
        script.onload = () => renderRecaptcha(recaptchaContainer, siteKey, resolve, reject);
      } else {
        renderRecaptcha(recaptchaContainer, siteKey, resolve, reject);
      }
    });
  };
  
  const renderRecaptcha = (container, siteKey, resolve, reject) => {
    window.grecaptcha.render(container.id, {
      sitekey: siteKey,
      callback: (response) => {
        resolve(response); // La validación fue exitosa
        cleanupRecaptcha(container);
      },
      "error-callback": () => {
        reject(new Error("Error al validar reCAPTCHA"));
        cleanupRecaptcha(container);
      },
      "expired-callback": () => {
        reject(new Error("reCAPTCHA expirado, intenta nuevamente"));
        cleanupRecaptcha(container);
      },
    });
  };
  
  const cleanupRecaptcha = (container) => {
    document.body.removeChild(container);
  };
  
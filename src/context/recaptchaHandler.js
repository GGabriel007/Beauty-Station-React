export const showRecaptcha = (siteKey) => {
  return new Promise((resolve, reject) => {
    // Ensure the container doesn't already exist
    let recaptchaContainer = document.getElementById("recaptcha-container");
    if (recaptchaContainer) {
      cleanupRecaptcha(recaptchaContainer);
    }

    // Create a new container for reCAPTCHA
    recaptchaContainer = document.createElement("div");
    recaptchaContainer.id = "recaptcha-container";
    document.body.appendChild(recaptchaContainer);

    // Load the reCAPTCHA script if not already loaded
    if (!document.querySelector(`script[src="https://www.google.com/recaptcha/api.js"]`)) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () =>
        renderRecaptcha(recaptchaContainer, siteKey, resolve, reject);
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
    if (container) {
      // Destroy the reCAPTCHA instance if it exists
      if (window.grecaptcha && window.grecaptcha.getResponse()) {
        window.grecaptcha.reset();
      }
      document.body.removeChild(container);
    }
  };
  
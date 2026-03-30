import { useEffect, useState } from "react";

const MyComponent = ({ onCaptchaSuccess }) => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  useEffect(() => {
    const scriptId = "recaptcha-script";

    // Add the reCAPTCHA script dynamically if not already present
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/recaptcha/api.js?render=6Lc0H74qAAAAAME8A4eQuydp-8ObZWE3mSviLq2c";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        //console.log("reCAPTCHA script loaded.");
        initializeRecaptcha();
      };

      document.body.appendChild(script);
    } else {
      // If the script is already present, initialize reCAPTCHA
      initializeRecaptcha();
    }

    // Cleanup script on unmount
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const initializeRecaptcha = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        //console.log("reCAPTCHA is ready.");
        executeRecaptcha();
      });
    } else {
      //console.error("reCAPTCHA not loaded. Check your script.");
    }
  };

  const executeRecaptcha = () => {
    window.grecaptcha
      .execute("6Lc0H74qAAAAAME8A4eQuydp-8ObZWE3mSviLq2c", { action: "homepage" })
      .then((token) => {
        //console.log("Generated token:", token);
        setRecaptchaToken(token); // Store the token in state
        if (onCaptchaSuccess) {
            onCaptchaSuccess(token); // Pass token so backend can verify it
        }
      })
      .catch((error) => {
        //console.error("Error executing reCAPTCHA:", error);
      });
  };

  return (
    <div id="recaptcha-container" className="recaptcha-status">
      <div className="recaptcha-left">
        <svg className="recaptcha-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
          <path fill="#4A90D9" d="M32 4L8 14v18c0 14 10.3 27.1 24 30 13.7-2.9 24-16 24-30V14L32 4z"/>
          <path fill="#fff" d="M28 42l-8-8 2.8-2.8L28 36.4l13.2-13.2L44 26z"/>
        </svg>
        <span className="recaptcha-brand">reCAPTCHA</span>
      </div>
      <span className="recaptcha-state-label">
        {recaptchaToken ? 'Verificado' : 'Verificando...'}
      </span>
    </div>
  );
};

export default MyComponent;

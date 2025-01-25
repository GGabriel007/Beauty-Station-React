import { useEffect, useState } from "react";

const MyComponent = ({ onCaptchaSuccess }) => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  useEffect(() => {
    const scriptId = "recaptcha-script";

    // Add the reCAPTCHA script dynamically if not already present
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = process.env.REACT_APP_GOOGLE_RECAPTCHA_URL;
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
        // Optionally, send the token to your backend for verification
        if (onCaptchaSuccess) {
            onCaptchaSuccess();
        }
      })
      .catch((error) => {
        //console.error("Error executing reCAPTCHA:", error);
      });
  };

  return (
    <div>
      <div id="recaptcha-container">
        <p>reCAPTCHA {recaptchaToken ? "válido ✅" : "aún no esta validado ⛔"}</p>
      </div>
    </div>
  );
};

export default MyComponent;

import { showRecaptcha } from "./recaptchaHandler";

const MyComponent = () => {


    const siteKey = "6Lc0H74qAAAAAME8A4eQuydp-8ObZWE3mSviLq2c";

    const handleValidate = async () => {
        try {
        const response = await showRecaptcha(siteKey);
        console.log("Validación exitosa:", response);
        // Here you can handle the response, how the hability for formula or to send data to a server. 
        } catch (error) {
        // Show user a message of an error to the user if neccesary.
        console.error("Error de validacion:", error.message);
        }
    };



    return (
        <div>
            <h1>Valida el reCAPTCHA</h1>
            <button onClick={handleValidate}>Validar reCAPTCHA</button>
        </div>  
    );
};

export default MyComponent; 


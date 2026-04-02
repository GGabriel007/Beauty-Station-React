import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// AWS Amplify Configuration imports
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import awsExports from './aws-exports';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Systematically load AWS's official UI translations and aggressively set it to Spanish 
I18n.putVocabularies(translations);
I18n.setLanguage('es');
I18n.putVocabulariesForLanguage('es', {
  'Sign in with Google': 'Iniciar sesión con Google',
  'Sign up with Google': 'Continuar con Google',
  'First Name': 'Nombre',
  'Last Name': 'Apellido',
  'Given Name': 'Nombre',
  'Family Name': 'Apellido',
  // Overrides: cambiar de "usted" a "tú"
  'Enter your Email': 'Escribe tu Email',
  'Enter your email': 'Escribe tu email',
  'Enter your Password': 'Escribe tu Contraseña',
  'Enter your code': 'Ingresa el código',
  'Enter your phone number': 'Ingresa el número de teléfono',
  'Enter your username': 'Ingresa el nombre de usuario',
  'Enter your Family Name': 'Escribe tu apellido',
  'Enter your Given Name': 'Escribe tu nombre',
  'Forgot your password?': '¿Olvidaste tu contraseña?',
  'Reset your password': 'Restablece tu contraseña',
  'Reset your Password': 'Restablece tu Contraseña',
  'Please confirm your Password': 'Confirma tu contraseña',
  'We Emailed You': 'Te hemos enviado un correo electrónico',
  'We Texted You': 'Te hemos enviado un mensaje de texto',
  'Your code is on the way. To log in, enter the code we sent you': 'El código está en camino. Para iniciar sesión, escribe el código que te hemos enviado',
  'Your code is on the way. To log in, enter the code we emailed to': 'El código está en camino. Para iniciar sesión, escribe el código que te enviamos por correo electrónico a',
  'Your code is on the way. To log in, enter the code we texted to': 'El código está en camino. Para iniciar sesión, escribe el código que te enviamos por mensaje de texto a',
});

// Initialize Amplify globally with the native configurations
Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provides the auth state to all child components (Header, Dashboard, etc.) */}
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

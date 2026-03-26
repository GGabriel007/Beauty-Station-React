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
  'Family Name': 'Apellido'
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

import React from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import '../styles/login.css';

// ─── Security Validators ──────────────────────────────────────────────────────

// 1. XSS: HTML tags, javascript: URIs, inline event handlers, <script>
const XSS_PATTERN = /<[^>]*>|javascript\s*:|on\w+\s*=|<\s*script/i;

// 2. SQL injection: dangerous keywords, comment sequences, statement terminators
const SQL_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC|EXECUTE|TRUNCATE|DECLARE|CAST|CONVERT)\b|--|;|\/\*|\*\/|xp_)/i;

// 3. Null bytes and ASCII control characters (often used to bypass filters)
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

// 4. Valid name: letters (incl. accented), spaces, hyphens, apostrophes — 2–60 chars
//    This already blocks !, @, #, ;, <, >, ", numbers, etc. by construction.
const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s'\-]{2,60}$/;

const hasDangerousContent = (value) =>
  XSS_PATTERN.test(value) || SQL_PATTERN.test(value) || CONTROL_CHAR_PATTERN.test(value);

const validateName = (value) => {
  if (!value || value.trim().length < 2)
    return 'Mínimo 2 caracteres.';
  if (value.trim().length > 60)
    return 'Máximo 60 caracteres.';
  if (hasDangerousContent(value))
    return 'El campo contiene caracteres no permitidos.';
  if (!NAME_PATTERN.test(value))
    return 'Solo se permiten letras, espacios, guiones y apóstrofes.';
};

const validateEmail = (value) => {
  if (!value || value.trim() === '')
    return 'El correo electrónico es requerido.';
  if (hasDangerousContent(value))
    return 'El campo contiene caracteres no permitidos.';
  // Only allow safe email characters: alphanumeric + . _ + - before @, domain after
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value.trim()))
    return 'Ingresa un correo electrónico válido.';
};

const validatePassword = (value) => {
  if (!value || value.length < 8)
    return 'La contraseña debe tener al menos 8 caracteres.';
  // Block XSS and null bytes in passwords (SQL chars are intentionally allowed
  // as they are valid password characters and handled safely by Cognito)
  if (XSS_PATTERN.test(value) || CONTROL_CHAR_PATTERN.test(value))
    return 'La contraseña contiene caracteres no permitidos.';
  if (!/[A-Z]/.test(value))
    return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(value))
    return 'Debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(value))
    return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(value))
    return 'Debe incluir al menos un carácter especial (ej. @, #, !).';
};

// ─── Confirm Sign-Up: Cancel button ───────────────────────────────────────────

function ConfirmSignUpFooter() {
  const { toSignIn } = useAuthenticator();
  return (
    <div className="confirm-cancel-footer">
      <button type="button" className="confirm-cancel-btn" onClick={toSignIn}>
        Cancelar
      </button>
    </div>
  );
}

const authenticatorComponents = {
  ConfirmSignUp: {
    Footer: ConfirmSignUpFooter,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const Login = () => {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If the user navigates directly to /login while already authenticated,
  // send them away. AuthRedirectHandler in App.js handles the real sign-in redirect.
  if (authStatus === 'authenticated') {
    return <Navigate to="/classes" replace />;
  }

  return (
    <div className="login-wrapper">
      <h1 className="login-page-title">Iniciar Sesión</h1>
      <div className="login-container">
        <Authenticator
          socialProviders={['google']}
          components={authenticatorComponents}
          formFields={{
            signUp: {
              given_name: {
                order: 1,
                label: 'Nombre',
                placeholder: 'Ingresa tu nombre',
                isRequired: true,
                validate: validateName,
              },
              family_name: {
                order: 2,
                label: 'Apellido',
                placeholder: 'Ingresa tu apellido',
                isRequired: true,
                validate: validateName,
              },
              email: {
                order: 3,
                validate: validateEmail,
              },
              password: {
                order: 4,
                validate: validatePassword,
              },
              confirm_password: {
                order: 5,
              },
            },
            signIn: {
              username: {
                validate: validateEmail,
              },
            },
            confirmResetPassword: {
              password: {
                validate: validatePassword,
              },
            },
            forceNewPassword: {
              password: {
                validate: validatePassword,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;

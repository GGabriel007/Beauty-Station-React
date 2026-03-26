import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

// ─── Security Validators ──────────────────────────────────────────────────────
// Blocks HTML tags, javascript: URIs, event handlers, and common injection
// patterns from being stored in Cognito user attributes.
const INJECTION_PATTERN = /<[^>]*>|javascript\s*:|on\w+\s*=|<\s*script/i;

// Valid name: letters (including accented), spaces, hyphens, apostrophes — 2–60 chars
const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s'\-]{2,60}$/;

const validateName = (value) => {
  if (!value || value.trim().length < 2)
    return 'Mínimo 2 caracteres.';
  if (value.trim().length > 60)
    return 'Máximo 60 caracteres.';
  if (INJECTION_PATTERN.test(value))
    return 'El campo contiene caracteres no permitidos.';
  if (!NAME_PATTERN.test(value))
    return 'Solo se permiten letras, espacios, guiones y apóstrofes.';
};

const validateEmail = (value) => {
  if (!value || value.trim() === '')
    return 'El correo electrónico es requerido.';
  if (INJECTION_PATTERN.test(value))
    return 'El campo contiene caracteres no permitidos.';
  // RFC-5321 compliant basic check
  const emailRegex = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
  if (!emailRegex.test(value.trim()))
    return 'Ingrese un correo electrónico válido.';
};

const validatePassword = (value) => {
  if (!value || value.length < 8)
    return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(value))
    return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(value))
    return 'Debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(value))
    return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(value))
    return 'Debe incluir al menos un carácter especial (ej. @, #, !).';
};

// ─── Component ────────────────────────────────────────────────────────────────

const Login = () => {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/cart');
    }
  }, [authStatus, navigate]);

  return (
    <div className="login-wrapper">
      <h1 className="login-page-title">Iniciar Sesión</h1>
      <div className="login-container">
        <Authenticator
          socialProviders={['google']}
          formFields={{
            signUp: {
              given_name: {
                order: 1,
                label: 'Nombre',
                placeholder: 'Ingrese su nombre',
                isRequired: true,
                validate: validateName,
              },
              family_name: {
                order: 2,
                label: 'Apellido',
                placeholder: 'Ingrese su apellido',
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
          }}
        />
      </div>
    </div>
  );
};

export default Login;

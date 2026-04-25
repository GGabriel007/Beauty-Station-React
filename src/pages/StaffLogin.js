// src/pages/StaffLogin.js
// Staff-only sign-in portal.
// — No sign-up tab, no Google SSO.
// — After sign-in checks Cognito group membership:
//     admin   → /admin
//     customer → sign out + redirect to /login with an explanation message

import React, { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import '../styles/login.css';
import '../styles/staff-login.css';

// ─── Validators (sign-in only — same rules as Login.js) ───────────────────────
const XSS_PATTERN          = /<[^>]*>|javascript\s*:|on\w+\s*=|<\s*script/i;
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

const validateEmail = (value) => {
  if (!value || value.trim() === '') return 'El correo electrónico es requerido.';
  if (XSS_PATTERN.test(value) || CONTROL_CHAR_PATTERN.test(value))
    return 'El campo contiene caracteres no permitidos.';
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value.trim())) return 'Ingresa un correo electrónico válido.';
};

const validatePassword = (value) => {
  if (!value || value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (XSS_PATTERN.test(value) || CONTROL_CHAR_PATTERN.test(value))
    return 'La contraseña contiene caracteres no permitidos.';
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(value)) return 'Debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Debe incluir al menos un carácter especial (ej. @, #, !).';
};

// ─── Inner component (must be inside Authenticator.Provider) ──────────────────
function StaffLoginInner() {
  const { authStatus } = useAuthenticator(ctx => [ctx.authStatus]);
  const navigate = useNavigate();

  // 'idle'     → Amplify still initialising
  // 'form'     → show the Authenticator sign-in card
  // 'checking' → user just signed in, verifying group membership
  // 'denied'   → not an admin, will redirect shortly
  const [phase, setPhase] = useState('idle');

  // Tell AuthRedirectHandler in App.js to stay out of the way while we
  // handle the redirect ourselves.
  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.setItem('staffLogin', 'true');
    const last = sessionStorage.getItem('lastLoginPage');
    sessionStorage.setItem('lastLoginPage', 'staff');
    if (last === 'user') window.location.reload();
    return () => sessionStorage.removeItem('staffLogin');
  }, []);

  useEffect(() => {
    if (authStatus === 'configuring') return;

    if (authStatus !== 'authenticated') {
      setPhase('form');
      return;
    }

    // Signed in — check group membership
    setPhase('checking');
    fetchAuthSession()
      .then(session => {
        sessionStorage.removeItem('staffLogin');
        const raw    = session?.tokens?.accessToken?.payload?.['cognito:groups'] || [];
        const groups = Array.isArray(raw)
          ? raw
          : String(raw).split(',').map(g => g.trim()).filter(Boolean);

        if (groups.includes('admin')) {
          navigate('/admin', { replace: true });
        } else {
          // Regular customer account — sign them out and redirect to /login
          setPhase('denied');
          signOut().finally(() => {
            setTimeout(() => navigate('/login', { replace: true }), 3200);
          });
        }
      })
      .catch(() => {
        sessionStorage.removeItem('staffLogin');
        navigate('/login', { replace: true });
      });
  }, [authStatus, navigate]);

  // ── Render states ────────────────────────────────────────────────────────────

  if (phase === 'idle') {
    return (
      <div className="staff-state-screen">
        <p className="staff-state-text">Cargando…</p>
      </div>
    );
  }

  if (phase === 'checking') {
    return (
      <div className="staff-state-screen">
        <div className="staff-spinner" />
        <p className="staff-state-text">Verificando acceso de empleado…</p>
      </div>
    );
  }

  if (phase === 'denied') {
    return (
      <div className="staff-denied-screen">
        <div className="staff-denied-card">
          <h2 className="staff-denied-title">Área Solo para Empleados</h2>
          <p className="staff-denied-text">
            Tu cuenta no corresponde a personal de Beauty Station.<br />
            Te redirigimos al portal de clientes.
          </p>
          <div className="staff-denied-progress">
            <div className="staff-denied-progress-fill" />
          </div>
        </div>
      </div>
    );
  }

  // phase === 'form'
  return (
    <div className="login-wrapper staff-login-wrapper">
      <div className="staff-login-eyebrow">
        Portal Exclusivo para Personal
      </div>

      <h1 className="login-page-title">Acceso Empleados</h1>

      <p className="staff-login-subtitle">
        Solo el personal autorizado de Beauty Station puede iniciar sesión en este portal.
      </p>

      <div className="login-container">
        <Authenticator
          hideSignUp
          socialProviders={[]}
          formFields={{
            signIn: {
              username: { validate: validateEmail },
              password: { validate: validatePassword },
            },
            confirmResetPassword: {
              password: { validate: validatePassword },
            },
            forceNewPassword: {
              password: { validate: validatePassword },
            },
          }}
        />
      </div>
    </div>
  );
}

export default function StaffLogin() {
  return <StaffLoginInner />;
}

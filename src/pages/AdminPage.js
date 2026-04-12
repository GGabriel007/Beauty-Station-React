// src/pages/AdminPage.js
//
// Phase 1: Protected shell that verifies the user is logged in AND belongs to
// the Cognito "admin" group before rendering anything.
//
// Phase 2 will replace the placeholder body with the full admin dashboard UI.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Reads the Cognito groups from the access-token payload embedded in the
// Amplify session object. Works for both email and Google OAuth sign-ins.
function useIsAdmin() {
  const { user } = useAuthenticator(ctx => [ctx.user]);
  if (!user) return false;
  const payload =
    user?.signInUserSession?.accessToken?.payload ||
    user?.signInDetails?.loginId
      ? user?.signInUserSession?.accessToken?.payload
      : {};
  const groups = payload?.['cognito:groups'] || [];
  return Array.isArray(groups)
    ? groups.includes('admin')
    : String(groups).split(',').map(g => g.trim()).includes('admin');
}

export default function AdminPage() {
  const { authStatus } = useAuthenticator(ctx => [ctx.authStatus]);
  const isAdmin = useIsAdmin();

  // Not logged in → send to /login
  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → show access denied
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Montserrat', sans-serif",
        padding: '40px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', maxWidth: '400px' }}>
          No tienes permisos de administrador para acceder a este panel.
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
      </div>
    );
  }

  // Admin authenticated → placeholder body (Phase 2 will replace this)
  return (
    <div style={{
      minHeight: '60vh',
      fontFamily: "'Montserrat', sans-serif",
      padding: '40px',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '2px' }}>
        PANEL DE ADMINISTRACIÓN
      </h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '0.9rem' }}>
        Beauty Station — Staff Only
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        maxWidth: '900px',
      }}>
        {[
          { label: 'Cursos',         icon: '📚', note: 'Fase 2' },
          { label: 'Curso en Línea', icon: '🎬', note: 'Fase 2' },
          { label: 'Inscripciones',  icon: '📋', note: 'Fase 2' },
          { label: 'Reseñas',        icon: '⭐', note: 'Fase 2' },
          { label: 'Configuración',  icon: '⚙️', note: 'Fase 2' },
        ].map(({ label, icon, note }) => (
          <div key={label} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            background: '#fafafa',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{note}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '40px', color: '#bbb', fontSize: '0.8rem' }}>
        Panel de administración — Fase 1 completada. La interfaz completa estará disponible en la Fase 2.
      </p>
    </div>
  );
}

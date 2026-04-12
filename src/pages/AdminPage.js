// src/pages/AdminPage.js
//
// Phase 1: Protected shell that verifies the user is logged in AND belongs to
// the Cognito "admin" group before rendering anything.
//
// Phase 2 will replace the placeholder body with the full admin dashboard UI.

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function AdminPage() {
  const { authStatus } = useAuthenticator(ctx => [ctx.authStatus]);
  const [isAdmin, setIsAdmin]   = useState(false);
  const [checking, setChecking] = useState(true);

  // Use fetchAuthSession() — the correct Amplify v6 way to read JWT claims.
  // This is the same pattern used in Dashboard.js and CartPage.js.
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setChecking(false);
      return;
    }
    fetchAuthSession()
      .then(session => {
        // cognito:groups lives in the access token payload
        const payload = session?.tokens?.accessToken?.payload || {};
        const rawGroups = payload['cognito:groups'] || [];
        const groups = Array.isArray(rawGroups)
          ? rawGroups
          : String(rawGroups).split(',').map(g => g.trim()).filter(Boolean);
        setIsAdmin(groups.includes('admin'));
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, [authStatus]);

  // Not logged in → redirect to /login
  if (authStatus !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  // Still reading the JWT — show a brief loading state
  if (checking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa', fontFamily: "'Montserrat', sans-serif" }}>Verificando permisos…</p>
      </div>
    );
  }

  // Authenticated but not in the admin group
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

  // ── Admin authenticated ── Phase 2 will replace this placeholder ─────────
  return (
    <div style={{ minHeight: '60vh', fontFamily: "'Montserrat', sans-serif", padding: '40px' }}>
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
        Fase 1 completada. La interfaz completa estará disponible en la Fase 2.
      </p>
    </div>
  );
}

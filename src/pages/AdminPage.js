// src/pages/AdminPage.js
// Phase 2 — Admin Shell with Beauty Station's rose/cream design language.
//
// Desktop: collapsible left sidebar (220 px → 56 px icon-only).
// Mobile (<768 px): sidebar hides; horizontal scrollable tab bar appears.

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import AdminDashboard     from '../components/admin/AdminDashboard';
import AdminCourses       from '../components/admin/AdminCourses';
import AdminOnlineCourse  from '../components/admin/AdminOnlineCourse';
import AdminRegistrations from '../components/admin/AdminRegistrations';
import AdminReviews       from '../components/admin/AdminReviews';
import AdminSettings      from '../components/admin/AdminSettings';
import AdminCoupons       from '../components/admin/AdminCoupons';

// ── Design tokens (match header.css) ──────────────────────────────────────────
const C = {
  roseLight : '#F0E2E9',   // page background
  roseTint  : '#E8CBD4',   // borders / separators
  rose      : '#cd929d',   // primary accent
  roseDeep  : '#7D4E61',   // active / strong accent
  text      : '#2A2A2A',   // body text
  muted     : '#888',
  white     : '#ffffff',
};
const FONT = "'Montserrat', sans-serif";

const TABS = [
  { id: 'dashboard',      label: 'Dashboard'      },
  { id: 'courses',        label: 'Cursos'          },
  { id: 'online-course',  label: 'Curso en Línea'  },
  { id: 'registrations',  label: 'Inscripciones'   },
  { id: 'reviews',        label: 'Reseñas'         },
  { id: 'coupons',        label: 'Cupones'         },
  { id: 'settings',       label: 'Configuración'   },
];

export default function AdminPage() {
  const { authStatus, user } = useAuthenticator(ctx => [ctx.authStatus, ctx.user]);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [checking,   setChecking]   = useState(true);
  const [activeTab,  setActiveTab]  = useState('dashboard');
  const [collapsed,  setCollapsed]  = useState(false);   // desktop only
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile menu overlay
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  // Track viewport width for responsive layout
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Verify admin group membership from JWT
  useEffect(() => {
    if (authStatus !== 'authenticated') { setChecking(false); return; }
    fetchAuthSession()
      .then(session => {
        const payload   = session?.tokens?.accessToken?.payload || {};
        const rawGroups = payload['cognito:groups'] || [];
        const groups    = Array.isArray(rawGroups)
          ? rawGroups
          : String(rawGroups).split(',').map(g => g.trim()).filter(Boolean);
        setIsAdmin(groups.includes('admin'));
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, [authStatus]);

  const handleLogout = async () => {
    sessionStorage.setItem('showLogoutToast', 'true');
    await signOut();
  };

  const handleTabSelect = id => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  // 'configuring' = Amplify is still resolving the session — wait, don't redirect yet.
  if (authStatus === 'configuring') return (
    <div style={centerFlex}>
      <p style={{ color: C.muted, fontFamily: FONT, letterSpacing: '1px', fontSize: '0.85rem' }}>Cargando…</p>
    </div>
  );

  // Truly not logged in — save /admin so the post-login redirect lands here, not /classes.
  if (authStatus !== 'authenticated') {
    sessionStorage.setItem('loginRedirect', '/admin');
    return <Navigate to="/login" replace />;
  }

  if (checking) return (
    <div style={centerFlex}>
      <p style={{ color: C.muted, fontFamily: FONT, letterSpacing: '1px', fontSize: '0.85rem' }}>
        Verificando permisos…
      </p>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ ...centerFlex, flexDirection: 'column', padding: '40px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: FONT, color: C.text, marginBottom: '12px' }}>
        Acceso Denegado
      </h2>
      <p style={{ color: C.muted, fontSize: '0.88rem', maxWidth: '380px', lineHeight: 1.7, fontFamily: FONT }}>
        No tienes permisos de administrador para acceder a este panel. Contacta al administrador del sistema.
      </p>
    </div>
  );

  const userEmail  = user?.signInDetails?.loginId || user?.username || 'Admin';
  const activeLabel = TABS.find(t => t.id === activeTab)?.label || '';
  const sidebarW    = collapsed ? 44 : 220;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 92px)', fontFamily: FONT, background: C.roseLight, position: 'relative' }}>

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile via isMobile flag)
          ════════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <aside style={{
          width: `${sidebarW}px`,
          background: C.white,
          borderRight: `1px solid ${C.roseTint}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          maxHeight: 'calc(100vh - 92px)',
          overflowY: 'auto',
          transition: 'width 0.22s ease',
        }}>

          {/* Brand bar */}
          <div style={{
            padding: collapsed ? '16px 0' : '16px 18px',
            borderBottom: `1px solid ${C.roseTint}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: '56px',
          }}>
            {!collapsed && (
              <div>
                <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.rose }}>Beauty Station</p>
                <p style={{ margin: 0, fontSize: '0.58rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted }}>Panel de Administración</p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.rose, fontSize: '0.8rem', padding: '4px', lineHeight: 1 }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          </div>

          {/* Navigation — hidden when collapsed */}
          <nav style={{ flex: 1, paddingTop: '6px', overflow: 'hidden' }}>
            {!collapsed && TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'flex-start',
                    width: '100%',
                    padding: '12px 18px',
                    background: active ? C.roseLight : 'transparent',
                    borderLeft: active ? `3px solid ${C.rose}` : '3px solid transparent',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderBottom: 'none',
                    color: active ? C.roseDeep : C.muted,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    fontFamily: FONT,
                    letterSpacing: active ? '0.8px' : '0.3px',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.roseDeep; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.muted; }}
                >
                  <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Staff info + logout — hidden when collapsed */}
          {!collapsed && (
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.roseTint}` }}>
              <p style={{ fontSize: '0.67rem', color: C.muted, marginBottom: '10px', wordBreak: 'break-all', lineHeight: 1.5, letterSpacing: '0.3px' }}>
                {userEmail}
              </p>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1.5px solid ${C.roseTint}`,
                  borderRadius: '50px',
                  padding: '9px 14px',
                  color: C.rose,
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontFamily: FONT,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'border-color 0.2s, color 0.2s',
                  textAlign: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.rose; e.currentTarget.style.color = C.roseDeep; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.roseTint; e.currentTarget.style.color = C.rose; }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </aside>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE TOP BAR  (visible only when isMobile)
          ════════════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <>
          {/* Mobile overlay backdrop — fades in/out */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40,
              opacity: mobileOpen ? 1 : 0,
              pointerEvents: mobileOpen ? 'auto' : 'none',
              transition: 'opacity 0.35s ease',
            }}
          />

          {/* Mobile slide-down menu */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: C.white,
            borderBottom: `1px solid ${C.roseTint}`,
            zIndex: 50,
            boxShadow: '0 8px 20px rgba(125,78,97,0.12)',
            padding: '12px 0',
            transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
            transition: 'transform 0.35s ease-in-out',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 12px', borderBottom: `1px solid ${C.roseTint}` }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.rose }}>Beauty Station</p>
                <p style={{ margin: 0, fontSize: '0.58rem', letterSpacing: '1px', color: C.muted }}>Panel de Administración</p>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.rose, lineHeight: 1 }}>✕</button>
            </div>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '14px 20px',
                  background: activeTab === tab.id ? C.roseLight : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === tab.id ? `3px solid ${C.rose}` : '3px solid transparent',
                  color: activeTab === tab.id ? C.roseDeep : C.text,
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.8rem', fontWeight: activeTab === tab.id ? 700 : 500,
                  fontFamily: FONT, letterSpacing: '0.8px', textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </button>
            ))}
            <div style={{ padding: '14px 20px 2px', borderTop: `1px solid ${C.roseTint}`, marginTop: '4px' }}>
              <p style={{ fontSize: '0.67rem', color: C.muted, margin: '0 0 10px' }}>{userEmail}</p>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: `1.5px solid ${C.roseTint}`, borderRadius: '50px',
                padding: '9px 20px', color: C.rose, cursor: 'pointer', fontSize: '0.72rem',
                fontFamily: FONT, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              }}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 32px', minWidth: 0 }}>

        {/* Mobile: compact top bar inside content area */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: `1px solid ${C.roseTint}` }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.rose }}>Beauty Station Admin</p>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{activeLabel}</p>
            </div>
            {/* Animated 3-bar hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', position: 'relative', width: '44px', height: '36px', flexShrink: 0 }}
              aria-label="Abrir menú"
            >
              <span style={{
                position: 'absolute', left: '8px', width: '28px', height: '2px', borderRadius: '1px',
                background: mobileOpen ? C.roseDeep : C.rose,
                top: '7px',
                transform: mobileOpen ? 'translateY(9px) rotate(45deg)' : 'none',
                transition: 'transform 0.35s ease, background-color 0.25s ease',
              }} />
              <span style={{
                position: 'absolute', left: '8px', width: '28px', height: '2px', borderRadius: '1px',
                background: C.rose,
                top: '16px',
                opacity: mobileOpen ? 0 : 1,
                transform: mobileOpen ? 'scaleX(0)' : 'none',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }} />
              <span style={{
                position: 'absolute', left: '8px', width: '28px', height: '2px', borderRadius: '1px',
                background: mobileOpen ? C.roseDeep : C.rose,
                top: '25px',
                transform: mobileOpen ? 'translateY(-9px) rotate(-45deg)' : 'none',
                transition: 'transform 0.35s ease, background-color 0.25s ease',
              }} />
            </button>
          </div>
        )}

        {/* Desktop: breadcrumb */}
        {!isMobile && (
          <p style={{ fontSize: '0.68rem', color: C.rose, marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Admin › {activeLabel}
          </p>
        )}

        {/* Tab content */}
        {activeTab === 'dashboard'      && <AdminDashboard />}
        {activeTab === 'courses'        && <AdminCourses />}
        {activeTab === 'online-course'  && <AdminOnlineCourse />}
        {activeTab === 'registrations'  && <AdminRegistrations />}
        {activeTab === 'reviews'        && <AdminReviews />}
        {activeTab === 'coupons'        && <AdminCoupons />}
        {activeTab === 'settings'       && <AdminSettings />}
      </main>
    </div>
  );
}

const centerFlex = { minHeight: 'calc(100vh - 92px)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

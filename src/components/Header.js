// src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import '../styles/header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const toggleMenu = () => { setMenuOpen(!menuOpen); };

  const location = useLocation();
  const navigate = useNavigate();
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  const { authStatus, signOut } = useAuthenticator((context) => [context.authStatus, context.signOut]);

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    // Flag persists through full-page OAuth redirects so the toast
    // can be shown after the app remounts.
    sessionStorage.setItem('showLogoutToast', 'true');
    signOut();
    // For local accounts signOut() is synchronous — the Hub fires
    // 'signedOut' which handles the toast + navigation (see App.js).
    // For Google OAuth, signOut() immediately redirects the browser,
    // so nothing below this line runs; the flag is read on remount.
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    navigate('/cart');
    setMenuOpen(false);
  };

  return (
    <div className="top">
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
      <div className='top-header'>
        <div className="header">
          <Link to="/">
            <img className="image-header" src={`${process.env.PUBLIC_URL}/images/Beauty_Station_logo.jpeg`} alt="Beauty Station logo" />
          </Link>
          <div className="menu-icon">
            <div className={`border-menu ${menuOpen ? 'clicked' : ''}`} onClick={toggleMenu}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
        </div>
        <ul className={`right-header-links ${menuOpen ? 'open' : ''}`}>
          <li><Link className={`header-button ${getActiveClass('/')}`} to="/" onClick={() => setMenuOpen(false)}>HOME</Link></li>
          <li><Link className={`header-button ${getActiveClass('/classes')}`} to="/classes" onClick={() => setMenuOpen(false)}>CURSOS</Link></li>
          <li><a className={`header-button ${getActiveClass('/cart')}`} href="/cart" onClick={handleCartClick}>CARRITO</a></li>
          <li><Link className={`header-button ${getActiveClass('/servicio-a-domicilio')}`} to="/servicio-a-domicilio" onClick={() => setMenuOpen(false)}>SERVICIO A DOMICILIO</Link></li>
          <li><Link className={`header-button ${getActiveClass('/nosotros')}`} to="/nosotros" onClick={() => setMenuOpen(false)}>NOSOTROS</Link></li>

          {authStatus === 'authenticated' ? (
            <>
              <li><Link className={`header-button ${getActiveClass('/dashboard')}`} to="/dashboard" onClick={() => setMenuOpen(false)}>MI PERFIL</Link></li>
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="header-button header-logout-btn">
                  CERRAR SESIÓN
                </button>
              </li>
            </>
          ) : (
            <li><Link className={`header-button ${getActiveClass('/login')}`} to="/login" onClick={() => setMenuOpen(false)}>INICIAR SESIÓN</Link></li>
          )}
        </ul>
      </div>
      <div className="line1"></div>

      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div className="logout-overlay" onClick={handleLogoutCancel}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <p className="logout-modal-title">¿Cerrar Sesión?</p>
            <p className="logout-modal-body">¿Estás segura/o de que deseas cerrar sesión?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={handleLogoutCancel}>Cancelar</button>
              <button className="logout-modal-confirm" onClick={handleLogoutConfirm}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

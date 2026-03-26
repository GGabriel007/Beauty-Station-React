// src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { toast } from 'react-toastify';
import '../styles/header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => { setMenuOpen(!menuOpen); };

  const location  = useLocation();
  const navigate  = useNavigate();
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  const { authStatus, signOut } = useAuthenticator((context) => [context.authStatus, context.signOut]);

  const handleCartClick = (e) => {
    e.preventDefault();
    if (authStatus !== 'authenticated') {
      sessionStorage.setItem('loginRedirect', '/classes');
      toast.warn('¡Inicia sesión para ver tu carrito!', {
        onClick: () => navigate('/login'),
        style: { cursor: 'pointer' },
      });
      navigate('/login');
      return;
    }
    navigate('/cart');
    setMenuOpen(false);
  };

  return (
    <div className="top">
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
          <li><Link className={`header-button ${getActiveClass('/classes')}`} to="/classes" onClick={() => setMenuOpen(false)}>Cursos</Link></li>
          <li><a className={`header-button ${getActiveClass('/cart')}`} href="/cart" onClick={handleCartClick}>Mi carrito</a></li>
          <li><Link className={`header-button ${getActiveClass('/servicio-a-domicilio')}`} to="/servicio-a-domicilio" onClick={() => setMenuOpen(false)}>Eventos</Link></li>
          <li><Link className={`header-button ${getActiveClass('/nosotros')}`} to="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link></li>

          {authStatus === 'authenticated' ? (
            <>
              <li><Link className={`header-button ${getActiveClass('/dashboard')}`} to="/dashboard" onClick={() => setMenuOpen(false)}>Mi perfil</Link></li>
              <li>
                <button
                  onClick={signOut}
                  className="header-button header-logout-btn">
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li><Link className={`header-button ${getActiveClass('/login')}`} to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link></li>
          )}
        </ul>
      </div>
      <div className="line1"></div>
    </div>
  );
};

export default Header;

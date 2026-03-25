// src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import '../styles/header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => { setMenuOpen(!menuOpen); };

  const location  = useLocation();
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  // Tap into Amplify's global authentication provider
  const { authStatus, signOut } = useAuthenticator((context) => [context.authStatus, context.signOut]);

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
          
          <li className='cart-header'>
            <Link className={`header-button-cart ${getActiveClass('/cart')}`} to="/cart">
              <img className="image-header-cart" src={`${process.env.PUBLIC_URL}/images/bag-cart2.png`} alt="Beauty Station Cart" />
            </Link>
          </li>
          
          <li><Link className={`header-button ${getActiveClass('/classes')}`} to="/classes">Cursos</Link></li>
          <li><Link className={`header-button ${getActiveClass('/servicio-a-domicilio')}`} to="/servicio-a-domicilio">Eventos</Link></li>
          <li><Link className={`header-button ${getActiveClass('/nosotros')}`} to="/nosotros">Nosotros</Link></li>
          
          {/* Dynamically swap UI if they are logged in vs logged out! */}
          {authStatus === 'authenticated' ? (
            <>
              <li><Link className={`header-button ${getActiveClass('/cart')}`} to="/cart">Mi Panel</Link></li>
              <li>
                <button 
                  onClick={signOut} 
                  className={`header-button`} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
                  Salir
                </button>
              </li>
            </>
          ) : (
            <li><Link className={`header-button ${getActiveClass('/login')}`} to="/login">Login</Link></li>
          )}
        </ul>
      </div>
      <div className="line1"></div>
    </div>
  );
};

export default Header;

// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
        <li><Link className="header-button" to="/classes">Clases</Link></li>
        <li><Link className="header-button" to="/servicio-a-domicilio">Servicio a Domicilio</Link></li>
        <li><Link className="header-button" to="/nosotros">Nosotros</Link></li>
      </ul>
      </div>
      <div className="line1"></div>
    </div>
  );
};

export default Header;

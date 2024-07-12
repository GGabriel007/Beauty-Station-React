// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
  return (
    <div className="top">
      <div className="header">
        <Link to="/">
        <img className="image-header" src={`${process.env.PUBLIC_URL}/images/Beauty_Station_logo.jpeg`} alt="Beauty Station logo" />
        </Link>
        <ul className="right-header-links">
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

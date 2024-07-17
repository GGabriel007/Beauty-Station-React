// src/components/Footer.js
import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  return (
    <div className="footer">
        <div className="action">
            <div className="line2"></div>
        <div className="container">
            <div className="action-text">
            <p className="first-action">¡Siguenos!</p>
            <p className="second-action">¡Puedes contactarnos y seguirnos en los siguientes enlaces!</p>
            </div>
            <div className="icons_social">
            <a className="single-icon" href="https://www.instagram.com/beautystationguate/" target="_blank" rel="noopener noreferrer">
                <img className="icon-Social-media" src={`${process.env.PUBLIC_URL}/images/social_media/instagram.png`} alt="Instagram logo icons created by Freepik - Flaticon" />
            </a>
            <a className="single-icon" href="https://api.whatsapp.com/send?phone=50250177803&text=Encontr%C3%A9%20sus%20redes%20sociales%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20de%20%3A" target="_blank" rel="noopener noreferrer">
                <img className="icon-Social-media" src={`${process.env.PUBLIC_URL}/images/social_media/whatsapp.png`} alt="Whatsapp logo icons created by Pixel Perfect - Flaticon" />
            </a>
            <a className="single-icon" href="https://www.tiktok.com/@alehgram" target="_blank" rel="noopener noreferrer">
                <img className="icon-Social-media" src={`${process.env.PUBLIC_URL}/images/social_media/tik-tok.png`} alt="Tiktok logo icons created by Freepik - Flaticon" />
            </a>
            </div>
        </div>
        </div>
        <div className="footer2">
        <p className="text-footer">© 2024 by Beauty Station</p>
        </div>
    </div>
  );
};

export default Footer;

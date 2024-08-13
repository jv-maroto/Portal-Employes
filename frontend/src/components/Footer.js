import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../static/css/footer.css';

const Footer = () => {
  const { pathname } = useLocation(); // Obtiene la ruta actual del navegador

  // No renderizar el footer en la página de inicio de sesión (/login)
  if (pathname === '/login') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="text-center d-flex align-items-center justify-content-center h-100">
        <a href="https://cybersecurity.telefonica.com/sandasgrc/?organization=DF3CFBF9-74D0-4018-B39E-8440FA6CE73B" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none">
          Portal de Denuncias
        </a>
      </div>
    </footer>
  );
};

export default Footer;

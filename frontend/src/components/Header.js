import React, { useState, useContext } from 'react';
import { BsBoxArrowRight } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../static/css/header.css';
import logo from '../static/img/logo.png';

const Header = () => {
  const { pathname } = useLocation();
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="fixed-header">
      <Navbar />
    </header>
  );
};

const Navbar = () => {
  const [activePage, setActivePage] = useState(null);
  const { user, logoutUser } = useContext(AuthContext);

  const handleNovedadesClick = () => {
    setActivePage('novedades');
  };

  const handleNominasClick = () => {
    setActivePage('nominas');
    window.open('https://sagreracanarias.es/Nominas', '_blank');
  };

  const handleVacacionesClick = () => {
    setActivePage('vacaciones');
    window.open('https://sagreracanarias.es/Nominas/fronted/login/Vacaciones/index.php', '_blank');
  };

  const handleLogoutClick = () => {
    logoutUser();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className={`nav-item ${activePage === 'novedades' ? 'active' : ''}`}>
              <a className="nav-link" href="/posts" onClick={handleNovedadesClick}>Novedades</a>
            </li>
            <li className={`nav-item ${activePage === 'nominas' ? 'active' : ''}`}>
              <a className="nav-link" href="/" onClick={handleNominasClick}>Nominas</a>
            </li>
            <li className={`nav-item ${activePage === 'vacaciones' ? 'active' : ''}`}>
              <a className="nav-link" href="/" onClick={handleVacacionesClick}>Vacaciones</a>
            </li>
            {user && user.is_superuser && (
              <li className="nav-item">
                <a className="nav-link" href="http://localhost:8000/post-admin/base/post/">Nueva Noticia</a>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="nav-link btnlogout btnlogout-link" onClick={handleLogoutClick}>
                <BsBoxArrowRight className="me-1" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;

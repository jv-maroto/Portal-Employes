import React, { useState, useEffect, useContext } from 'react';
import { BsBoxArrowRight } from 'react-icons/bs';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const [yearsNominas, setYearsNominas] = useState([]);
  const { user, authTokens, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchYearsNominas = async () => {
      if (user) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/years-nominas/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authTokens.access}`,
            },
          });

          if (response.ok) {
            const years = await response.json();
            setYearsNominas(years);
          } else {
            console.error('Error al obtener los años de nóminas:', response.statusText);
          }
        } catch (error) {
          console.error('Error al conectar con la API:', error);
        }
      }
    };

    fetchYearsNominas();
  }, [user, authTokens]);

  const handleNovedadesClick = () => {
    setActivePage('novedades');
  };

  const handleNominasClick = (year) => {
    setActivePage(`nominas-${year}`);
    navigate(`/nominas/${year}`);
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
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className={`nav-item ${activePage === 'novedades' ? 'active' : ''}`}>
              <Link className="nav-link" to="/posts" onClick={handleNovedadesClick}>
                Novedades
              </Link>
            </li>
            <li className={`nav-item dropdown ${activePage && activePage.startsWith('nominas') ? 'active' : ''}`}>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Nóminas
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                {yearsNominas.length > 0 ? (
                  yearsNominas.map((year) => (
                    <li key={year}>
                      <a className="dropdown-item" href="#" onClick={() => handleNominasClick(year)}>
                        {year}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className="dropdown-item">No hay nóminas disponibles</span>
                  </li>
                )}
              </ul>
            </li>
            <li className={`nav-item ${activePage === 'vacaciones' ? 'active' : ''}`}>
              <Link className="nav-link" to="/" onClick={handleVacacionesClick}>
                Vacaciones
              </Link>
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

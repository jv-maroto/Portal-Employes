import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';
import '../static/css/login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
  const { loginUser, error } = useContext(AuthContext);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordDni, setForgotPasswordDni] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [registerData, setRegisterData] = useState({ username: '', email: '', dni: '', password: '' });
  const [message, setMessage] = useState('');

  const handleForgotPasswordClose = () => setShowForgotPassword(false);
  const handleForgotPasswordShow = () => setShowForgotPassword(true);

  const handleRegisterClose = () => setShowRegister(false);
  const handleRegisterShow = () => setShowRegister(true);

  const handleResetPasswordClose = () => setShowResetPassword(false);
  const handleResetPasswordShow = () => setShowResetPassword(true);

  const handleErrorClose = () => setShowError(false);
  const handleErrorShow = () => {
    setShowError(true);
    setErrorMessage(error);
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/verify-dni/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dni: forgotPasswordDni })
    });

    if (response.status === 200) {
      setShowForgotPassword(false);
      handleResetPasswordShow();
    } else {
      const data = await response.json();
      setErrorMessage(data.message);
      handleErrorShow();
    }
  };

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/reset-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dni: forgotPasswordDni, new_password: resetPassword })
    });

    if (response.status === 200) {
      setMessage('Contraseña restablecida con éxito.');
      setTimeout(() => setMessage(''), 3000); // Limpiar el mensaje después de 3 segundos
      setResetPassword('');
      handleResetPasswordClose();
    } else {
      const data = await response.json();
      setErrorMessage(data.message);
      handleErrorShow();
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'), // Añadir CSRF token
      },
      body: JSON.stringify(registerData)
    });

    if (response.status === 201) {
      setMessage('Registro exitoso.');
      setTimeout(() => setMessage(''), 3000); // Limpiar el mensaje después de 3 segundos
      setRegisterData({ username: '', email: '', dni: '', password: '' });
      handleRegisterClose();
    } else {
      const data = await response.json();
      setErrorMessage(data.message);
      handleErrorShow();
    }
  };

  const handleLoginSubmit = async (e) => {
    await loginUser(e);
    if (error) {
      setErrorMessage(error);
      handleErrorShow();
    }
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  return (
    <div className="container my-5">
      <div className="card">
        <div className="row g-0">
          <div className="col-md-6">
            <img src="https://sagreracanarias.es/Documentos/imagenes/im1.jpg" alt="login form" className="rounded-start w-100" />
          </div>
          <div className="col-md-6">
            <div className="card-body d-flex flex-column">
              <div className="d-flex flex-row mt-2">
                <i className="fas fa-cubes fa-3x me-3" style={{ color: '#ff6219' }}></i>
                <span className="h1 fw-bold mb-0 title">Sagrera Canarias Empleados</span>
              </div>
              <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: '1px' }}>Entra a tu Cuenta</h5>
              <form onSubmit={handleLoginSubmit} className="border rounded p-4 shadow-sm">
                <div className="mb-4">
                  <label htmlFor="username" className="form-label">DNI</label>
                  <input type="text" className="form-control" id="username" name="username" placeholder="DNI" />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input type="password" className="form-control" id="password" name="password" placeholder="Contraseña" />
                </div>
                <button className="btn btn-dark mb-4 px-5" type="submit">Entrar</button>
              </form>
              <br />
              <a href="#!" className="small text-muted" onClick={handleForgotPasswordShow}>Te olvidaste de la contraseña?</a>
              <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>No tienes cuenta ? <a href="#!" style={{ color: '#393f81' }} onClick={handleRegisterShow}>Regístrate</a></p>
              {message && <div className="alert alert-success mt-4">{message}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Recuperar Contraseña */}
      <Modal show={showForgotPassword} onHide={handleForgotPasswordClose}>
        <Modal.Header closeButton>
          <Modal.Title>Recuperar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="forgotPasswordDni" className="form-label">DNI</label>
              <input
                type="text"
                className="form-control"
                id="forgotPasswordDni"
                placeholder="DNI"
                value={forgotPasswordDni}
                onChange={(e) => setForgotPasswordDni(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Enviar</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal para Establecer Nueva Contraseña */}
      <Modal show={showResetPassword} onHide={handleResetPasswordClose}>
        <Modal.Header closeButton>
          <Modal.Title>Establecer Nueva Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="resetPassword" className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="resetPassword"
                placeholder="Nueva Contraseña"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal para Registrarse */}
      <Modal show={showRegister} onHide={handleRegisterClose}>
        <Modal.Header closeButton>
          <Modal.Title>Registrarse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label htmlFor="registerUsername" className="form-label">Nombre de Usuario</label>
              <input
                type="text"
                className="form-control"
                id="registerUsername"
                placeholder="Nombre de Usuario"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                id="registerEmail"
                placeholder="Correo Electrónico"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerDni" className="form-label">DNI</label>
              <input
                type="text"
                className="form-control"
                id="registerDni"
                placeholder="DNI"
                value={registerData.dni}
                onChange={(e) => setRegisterData({ ...registerData, dni: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="registerPassword"
                placeholder="Contraseña"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Registrarse</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal para Errores */}
      <Modal show={showError} onHide={handleErrorClose}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleErrorClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginPage;
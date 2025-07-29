import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');  // Verifica si el token existe en el localStorage
  
    if (!token) {
      return <Navigate to="/login" />;  // Si no hay token, redirige al login
    }
  
    return children;  // Si hay token, renderiza la ruta protegida
  };
  
  export default PrivateRoute;
  
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SidebarWrapper from './components/SidebarWrapper';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Nominas from './pages/Nominas';
import Vacation from './pages/Vacaciones';
import Comunicados from './pages/Comunicados';
import ComunicadoPage from './comunicados/[id]/page'; // Importa la página de detalle del comunicado
import Recuperar from './pages/RecuPage';
import Registrar from './pages/RegisterPage';
import { VacationProvider } from './contexts/VacationContext';
import { PayslipProvider } from './contexts/NominasContext';
import { PostProvider } from './contexts/PostContext';
import PrivateRoute from './components/PrivateRoute';
import api from './api';
import VacacionesAdmin from '@/pages/admin/tablavacaciones';
import TablaVacaciones from "@/pages/admin/tablavacaciones";
import { ViewsProvider } from "@/contexts/ViewsContext";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (token) {
        try {
          await api.get('/profile'); // Verificar si el token es válido
          setIsAuthenticated(true);
        } catch (error) {
          if (error.response?.status === 401 && refreshToken) {
            try {
              const response = await api.post('/token/refresh/', { refresh: refreshToken });
              localStorage.setItem('access_token', response.data.access);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error('Error al refrescar el token:', refreshError);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              setIsAuthenticated(false);
            }
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
          }
        }
      }
    };
    verifyToken();
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken }, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setIsAuthenticated(false);
    }
  };

  return (
    <ViewsProvider>
      <div className="flex">
        {isAuthenticated && <SidebarWrapper onLogout={handleLogout} />}
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route path="/registro" element={<Registrar />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <VacationProvider>
                    <PayslipProvider>
                      <Dashboard />
                    </PayslipProvider>
                  </VacationProvider>
                </PrivateRoute>
              }
            />
            <Route
              path="/nominas"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Nominas />
                </PrivateRoute>
              }
            />
            <Route
              path="/vacaciones"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <Vacation />
                </PrivateRoute>
              }
            />
            <Route
              path="/comunicados"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <PostProvider>
                  <Comunicados />
                  </PostProvider>
                </PrivateRoute>
              }
            />
            <Route
              path="/comunicados/:id"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <ComunicadoPage />
                </PrivateRoute>
              }
            />
            <Route path="/admin/vacaciones" element={<VacacionesAdmin />} />
            <Route path="/admin/tablavacaciones" element={<TablaVacaciones />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </ViewsProvider>
  );
}

export default App;

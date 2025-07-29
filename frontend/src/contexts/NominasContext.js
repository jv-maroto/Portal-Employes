import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PayslipContext = createContext();

export const PayslipProvider = ({ children }) => {
  const [payrollData, setPayrollData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año actual por defecto
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Manejo del estado de carga

  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');
  const refreshToken = localStorage.getItem('refresh_token');

  const fetchPayrollData = useCallback(async (year) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/nominas/${username}/${year}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Username': username,
        },
      });
      return response.data;
    } catch (err) {
      console.error(`Error al obtener las nóminas del año ${year}:`, err);
      if (err.response && err.response.status === 401 && refreshToken) {
        // Intentar renovar el token si está expirado
        try {
          const refreshResponse = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('access_token', newAccessToken);

          // Reintentar la solicitud con el nuevo token
          const retryResponse = await axios.get(
            `http://localhost:8000/api/nominas/${username}/${year}/`,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            }
          );

          return retryResponse.data;
        } catch (refreshError) {
          console.error('Error al renovar el token:', refreshError);
          setError('No se pudo renovar el token. Inicia sesión nuevamente.');
        }
      } else {
        setError(`No se encontraron datos para el año ${year}.`);
      }
      return [];
    }
  }, [token, username, refreshToken]);

  useEffect(() => {
    const loadPayrollData = async () => {
      setLoading(true);
      setError(null);

      if (!username || !token) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      let data = await fetchPayrollData(selectedYear);

      if (data.length === 0) {
        // Si no hay datos en el año actual, buscar en el año anterior
        const previousYear = selectedYear - 1;
        console.warn(`No se encontraron nóminas para el año ${selectedYear}. Buscando en ${previousYear}...`);
        data = await fetchPayrollData(previousYear);
        if (data.length > 0) {
          setSelectedYear(previousYear); // Cambiar al año anterior dinámicamente
        }
      }

      setPayrollData(data);
      setLoading(false);
    };

    loadPayrollData();
  }, [selectedYear, token, username, refreshToken, fetchPayrollData]);

  return (
    <PayslipContext.Provider
      value={{
        payrollData,
        selectedYear,
        setSelectedYear,
        error,
        loading, // Exponer el estado de carga
      }}
    >
      {children}
    </PayslipContext.Provider>
  );
};

export const usePayslipContext = () => useContext(PayslipContext);

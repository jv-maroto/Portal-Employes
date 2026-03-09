import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

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
      const response = await api.get(`nominas/${username}/${year}/`, {
        headers: {
          'X-Username': username,
        },
      });
      return response.data;
    } catch (err) {
      // Error silenciado en producción
      if (err.response && err.response.status === 401 && refreshToken) {
        try {
          const refreshResponse = await api.post('token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('access_token', newAccessToken);

          const retryResponse = await api.get(
            `nominas/${username}/${year}/`,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            }
          );

          return retryResponse.data;
        } catch (refreshError) {
          // Error silenciado en producción
          setError('No se pudo renovar el token. Inicia sesión nuevamente.');
        }
      } else {
        setError(null);
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
        // Sin nóminas en el año seleccionado, buscar en el anterior
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

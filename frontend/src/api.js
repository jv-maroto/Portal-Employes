import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/";
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Crear la instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token de acceso en las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && token !== "undefined") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response, // Devuelve la respuesta directamente si es exitosa
  async (error) => {
    const originalRequest = error.config;

    // Si el token ha expirado y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Evitar bucles infinitos
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Intenta refrescar el token
          const response = await axios.post(
            `${API_BASE_URL}token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          localStorage.setItem("access_token", access);

          // Reintenta la solicitud original con el nuevo token
          originalRequest.headers["Authorization"] = `Bearer ${access}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          // Si falla el refresco, limpia los tokens y redirige al login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        // Si no hay refresh token, limpia y redirige al login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    // Si no es un error 401, rechaza la promesa
    return Promise.reject(error);
  }
);

export default api;

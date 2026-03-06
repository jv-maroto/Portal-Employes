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

// Control de refresco: evita múltiples refreshes simultáneos
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

function clearSessionAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("isAuthenticated");
  window.location.href = "/login";
}

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes('token/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya se está refrescando, esperar a que termine
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api.request(originalRequest));
          });
        });
      }

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}token/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh: newRefresh } = response.data;
        localStorage.setItem("access_token", access);
        if (newRefresh) {
          localStorage.setItem("refresh_token", newRefresh);
        }

        isRefreshing = false;
        onRefreshed(access);

        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Refresco proactivo: renueva el token antes de que expire
const REFRESH_INTERVAL = 1000 * 60 * 25; // 25 minutos (token dura 30)
setInterval(async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const accessToken = localStorage.getItem("access_token");
  if (!refreshToken || !accessToken) return;

  try {
    const response = await axios.post(
      `${API_BASE_URL}token/refresh/`,
      { refresh: refreshToken }
    );
    localStorage.setItem("access_token", response.data.access);
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }
  } catch {
    clearSessionAndRedirect();
  }
}, REFRESH_INTERVAL);

export default api;

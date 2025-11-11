import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to include the token BEFORE each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Obtener el token del almacenamiento
    
    if (token) {
      // If it exists, attach the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
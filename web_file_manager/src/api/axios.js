import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tu-api.com/api',
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
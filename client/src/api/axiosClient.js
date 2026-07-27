import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api' : '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !location.pathname.match(/^\/(login|register)/)) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export default api;

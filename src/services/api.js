import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.80:8080/api',
  timeout: 10000,
});

// Interceptor pour les tokens
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
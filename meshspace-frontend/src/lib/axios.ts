// src/lib/axios.ts
import axios from 'axios';
const BackendURL = import.meta.env.VITE_BACKEND_URL;
const baseURL = `${BackendURL}/api`
const axiosInstance = axios.create({
  baseURL:baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

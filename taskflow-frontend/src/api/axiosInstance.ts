import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const normalizedApiBaseUrl = apiBaseUrl ? apiBaseUrl.replace(/\/+$/, '') : '';

const axiosInstance = axios.create({
  baseURL: normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/api` : 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor — attach token to every request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yumzy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login failure attempts
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('yumzy_token');
        localStorage.removeItem('yumzy_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

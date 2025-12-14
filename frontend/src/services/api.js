// src/services/api.js
import axios from 'axios';

// Create a standalone instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Match your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
// Before any request is sent, this code runs automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (Optional but Pro Level)
// If the backend says "401 Unauthorized" (token expired), force logout.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Optional: Redirect to login page
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
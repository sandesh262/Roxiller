import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

console.log('API Service initialized with base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in both header formats for compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
      console.log('Added authentication token to request');
    } else {
      console.log('No authentication token available');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url} with status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response ? {
      status: error.response.status,
      url: error.config.url,
      data: error.response.data
    } : error.message);
    
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access detected - clearing credentials');
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

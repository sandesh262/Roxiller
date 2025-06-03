import axios from 'axios';

const BASE_URL = 'http://localhost:5000/test';

// Create axios instance for test routes that bypasses authentication
const testApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
testApi.interceptors.request.use(request => {
  console.log('Test API Request:', request.method, request.url, request.data);
  return request;
});

// Add response interceptor for debugging
testApi.interceptors.response.use(
  response => {
    console.log('Test API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Test API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default testApi;

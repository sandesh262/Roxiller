import api from './api';

// Register a new user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Update password
const updatePassword = async (passwordData) => {
  const response = await api.put('/auth/update-password', passwordData);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updatePassword
};

export default authService;

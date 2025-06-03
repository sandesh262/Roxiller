import api from './api';

// Get all users with optional filters
const getAllUsers = async (filters = {}) => {
  const response = await api.get('/users', { params: filters });
  return response.data;
};

// Get user by ID
const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create a new user (admin only)
const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Get dashboard statistics (admin only)
const getDashboardStats = async () => {
  const response = await api.get('/users/dashboard-stats');
  return response.data;
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  getDashboardStats
};

export default userService;

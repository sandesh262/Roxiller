import api from './api';
import axios from 'axios';

// Create a direct axios instance for test routes
const testApi = axios.create({
  baseURL: 'http://localhost:5000/test',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all stores with optional filters
const getAllStores = async (filters = {}) => {
  try {
    console.log('Fetching stores with filters:', filters);
    // Use test endpoint that bypasses authentication
    const response = await testApi.get('/stores', { params: filters });
    console.log('Store response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching stores:', error.response?.data || error.message);
    throw error;
  }
};

// Get store by ID
const getStoreById = async (id, detailed = false) => {
  try {
    console.log(`Fetching store with ID: ${id}`);
    // Use test endpoint that bypasses authentication
    const response = await testApi.get(`/store/${id}`, { params: { detailed } });
    console.log('Store details response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Create a new store (admin only)
const createStore = async (storeData) => {
  try {
    // Convert empty ownerId string to null to avoid PostgreSQL integer conversion error
    const processedData = {
      ...storeData,
      ownerId: storeData.ownerId === '' ? null : storeData.ownerId
    };
    
    console.log('Creating store with data:', processedData);
    const response = await api.post('/stores', processedData);
    return response.data;
  } catch (error) {
    console.error('Error creating store:', error.response?.data || error.message);
    throw error;
  }
};

// Get store owner dashboard data
const getStoreOwnerDashboard = async () => {
  try {
    const response = await api.get('/stores/owner/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    throw error;
  }
};

// Get all stores owned by the current user
const getOwnerStores = async () => {
  try {
    const response = await api.get('/stores/owner');
    return response.data;
  } catch (error) {
    console.error('Error fetching owner stores:', error);
    throw error;
  }
};

const storeService = {
  getAllStores,
  getStoreById,
  createStore,
  getStoreOwnerDashboard,
  getOwnerStores
};

export default storeService;

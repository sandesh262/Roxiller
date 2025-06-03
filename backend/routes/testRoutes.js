const express = require('express');
const router = express.Router();
const { Store } = require('../models');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`Test route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// Simple test endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Test API is working!' });
});

// Get all stores - completely bypassing any authentication
router.get('/stores', async (req, res) => {
  try {
    console.log('Test route: Getting all stores');
    
    // Simple query to get all stores
    const stores = await Store.findAll({
      attributes: ['id', 'name', 'email', 'address'],
      order: [['name', 'ASC']]
    });
    
    console.log(`Found ${stores.length} stores`);
    
    // Convert to plain objects and add default rating data
    const storesWithRatings = stores.map(store => ({
      ...store.toJSON(),
      averageRating: 0,
      ratingCount: 0,
      userRating: null
    }));
    
    return res.status(200).json({ stores: storesWithRatings });
  } catch (error) {
    console.error('Error in test getAllStores:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve stores',
      error: error.message
    });
  }
});

// Get store by ID - completely bypassing any authentication
router.get('/store/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Test route: Getting store with ID: ${id}`);
    
    // Find store
    const store = await Store.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address']
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Convert to plain object and add default rating data
    const storeData = {
      ...store.toJSON(),
      averageRating: 0,
      ratingCount: 0,
      userRating: null
    };
    
    return res.status(200).json({ store: storeData });
  } catch (error) {
    console.error('Error in test getStoreById:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve store',
      error: error.message
    });
  }
});

module.exports = router;

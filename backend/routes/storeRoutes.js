const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById, createStore, getStoreOwnerDashboard } = require('../controllers/storeController');
const { authenticateUser, isAdmin, isStoreOwner, optionalAuth } = require('../middleware/auth');

// Debug middleware to log requests
const logRequest = (req, res, next) => {
  console.log(`Store route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  next();
};

// Completely public routes - no authentication
// Using logRequest middleware to debug
router.get('/', logRequest, getAllStores);
router.get('/:id', logRequest, getStoreById);

// Admin only routes
router.post('/', logRequest, authenticateUser, isAdmin, createStore);

// Store owner routes
router.get('/owner/dashboard', logRequest, authenticateUser, isStoreOwner, getStoreOwnerDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, getDashboardStats } = require('../controllers/userController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Apply authentication and admin role per route instead of globally
router.get('/', authenticateUser, isAdmin, getAllUsers);
router.get('/dashboard-stats', authenticateUser, isAdmin, getDashboardStats);
router.get('/:id', authenticateUser, isAdmin, getUserById);
router.post('/', authenticateUser, isAdmin, createUser);

module.exports = router;

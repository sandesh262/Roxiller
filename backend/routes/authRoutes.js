const express = require('express');
const router = express.Router();
const { register, login, updatePassword, getCurrentUser } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/update-password', authenticateUser, updatePassword);
router.get('/me', authenticateUser, getCurrentUser);

module.exports = router;

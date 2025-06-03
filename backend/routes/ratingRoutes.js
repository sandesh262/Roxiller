const express = require('express');
const router = express.Router();
const { submitRating, getUserRatings } = require('../controllers/ratingController');
const { optionalAuth } = require('../middleware/auth');

// Use optional authentication - will set default user if no auth token
// This ensures req.user is always available for the controller functions
router.use(optionalAuth);

// Rating submission route - no authentication required
router.post('/', (req, res) => {
  console.log('[ROUTES] Rating submission route accessed');
  return submitRating(req, res);
});

// Get user ratings route - no authentication required
router.get('/user', (req, res) => {
  console.log('[ROUTES] Get user ratings route accessed');
  return getUserRatings(req, res);
});

module.exports = router;

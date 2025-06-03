const { Rating, Store, User } = require('../models');

// Submit a rating for a store
exports.submitRating = async (req, res) => {
  try {
    console.log('[RATING] Rating submission received:', req.body);
    
    // Allow userId to be passed in body for testing, otherwise use authenticated user
    const userId = req.body.userId || (req.user ? req.user.id : 1);
    const { storeId, rating } = req.body;
    
    console.log('[RATING] Processing rating data:', { userId, storeId, rating });

    // Validate input
    if (!storeId) {
      console.error('[RATING] Missing storeId in request');
      return res.status(400).json({ message: 'Store ID is required' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      console.error('[RATING] Invalid rating value:', rating);
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      console.error('[RATING] Store not found with ID:', storeId);
      return res.status(404).json({ message: 'Store not found' });
    }
    
    console.log('[RATING] Store found:', store.name);

    // Check if user has already rated this store
    let existingRating = await Rating.findOne({
      where: { userId, storeId }
    });
    
    console.log('[RATING] Existing rating check result:', existingRating ? 'Found' : 'Not found');
    
    if (existingRating) {
      // Update existing rating
      await existingRating.update({ rating });
      console.log('[RATING] Updated existing rating to:', rating);
    } else {
      // Create new rating
      try {
        existingRating = await Rating.create({
          userId,
          storeId,
          rating
        });
        console.log('[RATING] Created new rating with ID:', existingRating.id);
      } catch (createError) {
        console.error('[RATING] Database error creating rating:', createError);
        return res.status(500).json({ 
          message: 'Failed to create rating in database',
          details: createError.message 
        });
      }
    }

    return res.status(200).json({
      message: 'Rating submitted successfully',
      rating: existingRating
    });
  } catch (error) {
    console.error('[RATING] Error submitting rating:', error);
    return res.status(500).json({ 
      message: 'Failed to submit rating', 
      details: error.message 
    });
  }
};

// Get user's ratings (normal user only)
exports.getUserRatings = async (req, res) => {
  try {
    console.log('[RATING] Get user ratings request received');
    // Use userId from query params if provided (for testing), otherwise use from authenticated user
    const userId = req.query.userId || (req.user ? req.user.id : 1);
    
    console.log('[RATING] Fetching ratings for user ID:', userId);
    
    // Get all ratings by user
    const ratings = await Rating.findAll({
      where: { userId },
      include: [
        {
          model: Store,
          attributes: ['id', 'name', 'address']
        }
      ]
    });
    
    console.log(`[RATING] Found ${ratings.length} ratings for user ID ${userId}`);
    
    return res.status(200).json({ 
      message: 'Ratings retrieved successfully',
      ratings 
    });
  } catch (error) {
    console.error('[RATING] Error getting user ratings:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve ratings', 
      details: error.message 
    });
  }
};

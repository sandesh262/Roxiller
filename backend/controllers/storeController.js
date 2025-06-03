const { Store, User, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all stores
const getAllStores = async (req, res) => {
  try {
    console.log('Get all stores request received', req.query);
    
    // Simple database connection check
    try {
      await sequelize.authenticate();
      console.log('Database connection is OK');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ message: 'Database connection error' });
    }
    
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
    
    console.log('Returning all stores');
    return res.status(200).json({ stores: storesWithRatings });
  } catch (error) {
    console.error('Error in getAllStores:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve stores',
      error: error.message
    });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    console.log('Get store by ID request received', req.params);
    const { id } = req.params;
    
    // Find store with owner info but without group by
    const store = await Store.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: ['id', 'name', 'email', 'address']
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Get ratings separately
    const ratingData = await Rating.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ratingCount']
      ],
      where: { storeId: id }
    });
    
    // Convert store to JSON and add rating data
    const storeData = store.toJSON();
    storeData.averageRating = ratingData ? parseFloat(ratingData.getDataValue('averageRating')) || 0 : 0;
    storeData.ratingCount = ratingData ? parseInt(ratingData.getDataValue('ratingCount')) || 0 : 0;
    
    // For normal users, get their submitted rating for this store
    if (req.user && req.user.role === 'user') {
      const userId = req.user.id;
      
      // Get user's rating for this store
      const userRating = await Rating.findOne({
        where: { userId, storeId: id },
        attributes: ['rating']
      });
      
      storeData.userRating = userRating ? userRating.rating : null;
      
      console.log('Returning store with user rating');
      return res.status(200).json({ store: storeData });
    }
    
    console.log('Returning store details');
    res.status(200).json({ store: storeData });
  } catch (error) {
    console.error('Error in getStoreById:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack,
      name: error.name 
    });
  }
};

// Create a new store (admin only)
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    
    console.log('Store creation request received:', { name, email, address, ownerId });
    
    // Check if store already exists
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }
    
    // Handle ownerId properly - ensure it's null if empty or undefined
    let processedOwnerId = null;
    
    if (ownerId && ownerId !== '') {
      // If ownerId is provided, check if user exists and is a store owner
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      
      // Update user role to store_owner if not already
      if (owner.role !== 'store_owner') {
        await owner.update({ role: 'store_owner' });
      }
      
      processedOwnerId = ownerId;
    }
    
    // Create new store with properly processed ownerId
    const store = await Store.create({
      name,
      email,
      address,
      ownerId: processedOwnerId
    });
    
    console.log('Store created successfully:', store.id);
    
    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack,
      name: error.name
    });
  }
};

// Get store owner dashboard data
const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    // Find store owned by user
    const store = await Store.findOne({
      where: { ownerId },
      attributes: ['id', 'name', 'email', 'address']
    });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found for this owner' });
    }
    
    // Get average rating
    const ratingData = await Rating.findAll({
      where: { storeId: store.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
      ]
    });
    
    // Get users who rated the store
    const usersWhoRated = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: ['rating', 'createdAt']
    });
    
    const averageRating = ratingData[0].dataValues.averageRating || 0;
    const totalRatings = ratingData[0].dataValues.totalRatings || 0;
    
    // Format users who rated
    const formattedUsers = usersWhoRated.map(rating => ({
      id: rating.User.id,
      name: rating.User.name,
      email: rating.User.email,
      rating: rating.rating,
      ratedAt: rating.createdAt
    }));
    
    res.status(200).json({
      store,
      stats: {
        averageRating,
        totalRatings
      },
      usersWhoRated: formattedUsers
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  getStoreOwnerDashboard
};

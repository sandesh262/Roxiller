const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (name) {
      whereConditions.name = { [Op.like]: `%${name}%` };
    }
    
    if (email) {
      whereConditions.email = { [Op.like]: `%${email}%` };
    }
    
    if (address) {
      whereConditions.address = { [Op.like]: `%${address}%` };
    }
    
    if (role) {
      whereConditions.role = role;
    }
    
    // Get users with filters
    const users = await User.findAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          required: false
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is a store owner, get their store's average rating
    let storeRating = null;
    if (user.role === 'store_owner' && user.Store) {
      const ratings = await Rating.findAll({
        where: { storeId: user.Store.id }
      });
      
      if (ratings.length > 0) {
        const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
        storeRating = totalRating / ratings.length;
      }
    }
    
    // Format response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };
    
    if (storeRating !== null) {
      userData.storeRating = storeRating;
    }
    
    res.status(200).json({ user: userData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      address,
      role
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get dashboard statistics (admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.count();
    
    // Count total stores
    const totalStores = await Store.count();
    
    // Count total ratings
    const totalRatings = await Rating.count();
    
    res.status(200).json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  getDashboardStats
};

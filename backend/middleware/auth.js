const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

// Read authentication settings from environment variables
const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true';

// List of paths that should bypass authentication
const PUBLIC_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/ratings',
  '/api/stores',
  '/api/stores/', // Added trailing slash version
  '/api/ratings/user',
  '/ping',
  '/',
  '/api/test', // For testing
  '/test' // For testing
];

// Additional check for store ID paths like /api/stores/1
const STORE_ID_REGEX = /^\/api\/stores\/\d+$/;

// Helper function to check if a path should bypass authentication
const isPublicPath = (path) => {
  console.log(`Checking if path is public: ${path}`);
  
  // First check if it matches the store ID pattern
  if (STORE_ID_REGEX.test(path)) {
    console.log(`  Path ${path} matches store ID pattern, treating as public`);
    return true;
  }
  
  // For debugging - log the comparison with each public path
  const isPublic = PUBLIC_PATHS.some(publicPath => {
    const exactMatch = path === publicPath;
    const subpathMatch = path.startsWith(`${publicPath}/`);
    const wildcardMatch = publicPath.includes('*') && new RegExp(publicPath.replace('*', '.*')).test(path);
    console.log(`  Comparing with ${publicPath}: exact=${exactMatch}, subpath=${subpathMatch}, wildcard=${wildcardMatch}`);
    return exactMatch || subpathMatch || wildcardMatch;
  });
  
  console.log(`Path ${path} is ${isPublic ? 'public' : 'not public'}`);
  return isPublic;
};



// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
  // Log authentication check for debugging
  console.log(`Authentication check for path: ${req.path}`);
  console.log(`DISABLE_AUTH: ${DISABLE_AUTH}`);
  console.log(`isPublicPath: ${isPublicPath(req.path)}`);
  
  // Check both environment variable and public path configurations
  const shouldBypassAuth = DISABLE_AUTH === true || isPublicPath(req.path);
  
  // If auth should be bypassed, skip token verification
  if (shouldBypassAuth) {
    console.log('Authentication bypassed for this route');
    // Set a default user for development
    if (process.env.NODE_ENV !== 'production') {
      req.user = { 
        id: 1, 
        role: 'user',
        email: 'test@example.com',
        name: 'Test User'
      };
    }
    return next();
  }

  try {
    // Get token from header - check both x-auth-token and Authorization headers
    let token = req.header('x-auth-token');
    
    // If no token in x-auth-token, check Authorization header (used by frontend)
    if (!token && req.header('Authorization')) {
      // Extract token from 'Bearer TOKEN' format
      const authHeader = req.header('Authorization');
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    console.log(`Token provided: ${token ? 'Yes' : 'No'}`);

    // Check if no token
    if (!token) {
      console.log('No token provided, access denied');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token verified, user ID: ${decoded.id}`);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user in request
    req.user = user;
    console.log(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional authentication middleware - will set a default user if no token provided
const optionalAuth = async (req, res, next) => {
  // Log optional auth check for debugging
  console.log(`Optional auth check for path: ${req.path}`);
  
  // Always set default user in development mode to ensure req.user exists
  if (process.env.NODE_ENV !== 'production') {
    req.user = { 
      id: 1, 
      role: 'user',
      email: 'test@example.com',
      name: 'Test User'
    };
    console.log('Default user set for development');
  }
  
  // If auth is globally disabled or path is public, just use the default user
  if (DISABLE_AUTH || isPublicPath(req.path)) {
    console.log('Optional auth bypassed - using default user');
    return next();
  }

  try {
    // Get token from header - check both x-auth-token and Authorization headers
    let token = req.header('x-auth-token');
    
    // If no token in x-auth-token, check Authorization header (used by frontend)
    if (!token && req.header('Authorization')) {
      // Extract token from 'Bearer TOKEN' format
      const authHeader = req.header('Authorization');
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    console.log(`Optional auth token provided: ${token ? 'Yes' : 'No'}`);

    // If no token, use the default user we already set
    if (!token) {
      console.log('No token in optional auth - using default user');
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Optional auth token verified, user ID: ${decoded.id}`);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (user) {
      // Set user in request if found
      req.user = user;
      console.log(`User found and set in optional auth: ${user.email}`);
    } else {
      console.log('User not found in optional auth, using default');
    }
    
    next();
  } catch (error) {
    // If token verification fails, just use the default user
    console.log(`Token verification failed in optional auth: ${error.message}`);
    next();
  }
};

// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
  // If auth is disabled or path should be public, bypass role check
  if (DISABLE_AUTH || isPublicPath(req.path)) {
    return next();
  }
  
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

// Middleware to check if user is store owner
const isStoreOwner = (req, res, next) => {
  // If auth is disabled or path should be public, bypass role check
  if (DISABLE_AUTH || isPublicPath(req.path)) {
    return next();
  }
  
  if (!req.user || req.user.role !== 'store_owner') {
    return res.status(403).json({ message: 'Access denied. Store owner role required.' });
  }
  
  next();
};

// Middleware to check if user is normal user
const isUser = (req, res, next) => {
  // If auth is disabled or path should be public, bypass role check
  if (DISABLE_AUTH || isPublicPath(req.path)) {
    return next();
  }
  
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. User role required.' });
  }
  
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth,
  isAdmin,
  isStoreOwner,
  isUser
};

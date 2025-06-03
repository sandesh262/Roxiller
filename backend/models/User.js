const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [2, 60],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [4, 100] // Relaxed validation to accommodate various password requirements
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [1, 400]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'store_owner'),
    defaultValue: 'user'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      // Password validation - more lenient for testing
      if (process.env.NODE_ENV === 'production') {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
        if (!passwordRegex.test(user.password)) {
          throw new Error('Password must be 8-16 characters with at least one uppercase letter and one special character');
        }
      } else {
        // In development, just ensure password is at least 4 characters
        if (user.password.length < 4) {
          throw new Error('Password must be at least 4 characters');
        }
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      // Only hash if password is being updated
      if (user.changed('password')) {
        // Password validation - more lenient for testing
        if (process.env.NODE_ENV === 'production') {
          const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
          if (!passwordRegex.test(user.password)) {
            throw new Error('Password must be 8-16 characters with at least one uppercase letter and one special character');
          }
        } else {
          // In development, just ensure password is at least 4 characters
          if (user.password.length < 4) {
            throw new Error('Password must be at least 4 characters');
          }
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

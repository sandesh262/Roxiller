import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/store-owner/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Roxiller Rating App
          </Link>
        </Typography>
        
        {user ? (
          <Box>
            <Button 
              color="inherit" 
              component={Link} 
              to={getDashboardLink()}
            >
              Dashboard
            </Button>
            
            {user.role === 'user' && (
              <Button 
                color="inherit" 
                component={Link} 
                to="/user/stores"
              >
                Stores
              </Button>
            )}
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/profile"
            >
              Profile
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
            >
              Login
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

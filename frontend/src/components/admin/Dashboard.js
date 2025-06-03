import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import userService from '../../services/userService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await userService.getDashboardStats();
        setStats(response.stats);
      } catch (error) {
        setError('Failed to load dashboard statistics');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/admin/users"
              sx={{ mr: 2 }}
            >
              Manage Users
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link} 
              to="/admin/stores"
            >
              Manage Stores
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {/* Total Users Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Total Stores Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">
                    Total Stores
                  </Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.totalStores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Total Ratings Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <StarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">
                    Total Ratings
                  </Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.totalRatings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Quick Action Buttons */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                User Management
              </Typography>
              <Typography variant="body1" paragraph>
                Create, view, and manage users including admins, store owners, and regular users.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/admin/users"
                >
                  View All Users
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  component={Link} 
                  to="/admin/users/create"
                >
                  Create New User
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Store Management
              </Typography>
              <Typography variant="body1" paragraph>
                Create, view, and manage stores and assign them to store owners.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  component={Link} 
                  to="/admin/stores"
                >
                  View All Stores
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  component={Link} 
                  to="/admin/stores/create"
                >
                  Create New Store
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;

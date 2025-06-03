import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../utils/AuthContext';
import storeService from '../../services/storeService';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchOwnerStores();
  }, []);

  const fetchOwnerStores = async () => {
    try {
      const response = await storeService.getOwnerStores();
      setStores(response.stores);
      
      // Calculate stats
      const totalStores = response.stores.length;
      let totalRatings = 0;
      let ratingSum = 0;
      
      response.stores.forEach(store => {
        totalRatings += store.ratingCount || 0;
        if (store.averageRating) {
          ratingSum += store.averageRating * (store.ratingCount || 0);
        }
      });
      
      const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
      
      setStats({
        totalStores,
        totalRatings,
        averageRating
      });
      
      setError('');
    } catch (error) {
      setError('Failed to load your stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Store Owner Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">
                    My Stores
                  </Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.totalStores}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">
                    Average Rating
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Rating 
                    value={stats.averageRating} 
                    precision={0.1} 
                    readOnly 
                    size="large" 
                  />
                  <Typography variant="h5" sx={{ ml: 1 }}>
                    ({stats.averageRating.toFixed(1)})
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            My Stores
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/store-owner/stores/create"
          >
            Add New Store
          </Button>
        </Box>
        
        {stores.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              You don't have any stores yet.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/store-owner/stores/create"
            >
              Create Your First Store
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {stores.map(store => (
              <Grid item xs={12} md={6} key={store.id}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {store.name}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Address:</strong> {store.address}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Email:</strong> {store.email}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Rating:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating 
                          value={store.averageRating || 0} 
                          precision={0.1} 
                          readOnly 
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({store.averageRating ? store.averageRating.toFixed(1) : 'N/A'})
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to={`/store-owner/stores/${store.id}`}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StoreOwnerDashboard;

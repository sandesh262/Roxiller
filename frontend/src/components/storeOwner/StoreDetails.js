import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Rating,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import storeService from '../../services/storeService';

const StoreOwnerStoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const response = await storeService.getStoreById(id, true); // true for detailed view with ratings
      setStore(response.store);
      setRatings(response.store.ratings || []);
      setError('');
    } catch (error) {
      setError('Failed to load store details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    ratings.forEach(rating => {
      distribution[rating.rating] = (distribution[rating.rating] || 0) + 1;
    });
    
    return distribution;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!store) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Store not found or you don't have permission to view it
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/store-owner/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const ratingDistribution = calculateRatingDistribution();
  const totalRatings = ratings.length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/store-owner/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {store.name}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Address:</strong> {store.address}
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Email:</strong> {store.email}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  <strong>Overall Rating:</strong>
                </Typography>
                <Rating 
                  value={store.averageRating || 0} 
                  precision={0.1} 
                  readOnly 
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  ({store.averageRating ? store.averageRating.toFixed(1) : 'N/A'})
                </Typography>
              </Box>
              
              <Typography variant="body1">
                <strong>Total Ratings:</strong> {totalRatings}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Typography variant="h5" gutterBottom>
          Rating Distribution
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          {totalRatings === 0 ? (
            <Typography variant="body1" align="center">
              No ratings yet
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {[5, 4, 3, 2, 1].map(star => (
                <Grid item xs={12} key={star}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '60px' }}>
                      <Typography variant="body1">
                        {star} {star === 1 ? 'star' : 'stars'}
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        flexGrow: 1, 
                        height: '20px', 
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        mr: 2,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${(ratingDistribution[star] / totalRatings) * 100}%`,
                          bgcolor: star > 3 ? 'success.main' : star > 1 ? 'warning.main' : 'error.main',
                          borderRadius: 1
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ width: '80px' }}>
                      <Typography variant="body2">
                        {ratingDistribution[star]} ({Math.round((ratingDistribution[star] / totalRatings) * 100)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
        
        <Typography variant="h5" gutterBottom>
          Rating Details
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No ratings yet
                  </TableCell>
                </TableRow>
              ) : (
                ratings.map(rating => (
                  <TableRow key={rating.id}>
                    <TableCell>{rating.user?.name || 'Anonymous'}</TableCell>
                    <TableCell>
                      <Rating value={rating.rating} readOnly />
                    </TableCell>
                    <TableCell>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default StoreOwnerStoreDetails;

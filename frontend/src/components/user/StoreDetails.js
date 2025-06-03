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
  Card,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import storeService from '../../services/storeService';
import ratingService from '../../services/ratingService';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const response = await storeService.getStoreById(id);
      setStore(response.store);
      
      // Set user's rating if available
      if (response.store.userRating !== null) {
        setUserRating(response.store.userRating);
      }
      
      setError('');
    } catch (error) {
      setError('Failed to load store details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (event, newValue) => {
    setUserRating(newValue);
  };

  const handleSubmitRating = async () => {
    if (userRating < 1) {
      setError('Please select a rating between 1 and 5');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await ratingService.submitRating({
        storeId: id,
        rating: userRating
      });
      
      setSuccess('Rating submitted successfully');
      fetchStoreDetails(); // Refresh store details
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
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
          Store not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/user/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/user/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Stores
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {store.name}
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Address:</strong> {store.address}
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Email:</strong> {store.email}
          </Typography>
          
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
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Your Rating
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Rate this store:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={handleRatingChange}
                  size="large"
                />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {userRating > 0 ? `${userRating} stars` : 'Select a rating'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={handleSubmitRating}
                disabled={submitting || userRating < 1}
              >
                {submitting ? 'Submitting...' : store.userRating !== null ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default StoreDetails;

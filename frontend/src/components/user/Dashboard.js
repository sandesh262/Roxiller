import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import storeService from '../../services/storeService';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Filter stores based on search term
    if (searchTerm.trim() === '') {
      setFilteredStores(stores);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = stores.filter(
        store => 
          store.name.toLowerCase().includes(term) || 
          store.address.toLowerCase().includes(term)
      );
      setFilteredStores(filtered);
    }
  }, [searchTerm, stores]);

  const fetchStores = async () => {
    try {
      const response = await storeService.getAllStores();
      setStores(response.stores);
      setFilteredStores(response.stores);
      setError('');
    } catch (error) {
      setError('Failed to load stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Find Stores
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Search by store name or address"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>
              Available Stores
            </Typography>
            
            {filteredStores.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No stores found matching your search criteria.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredStores.map(store => (
                  <Grid item xs={12} sm={6} md={4} key={store.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                          {store.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {store.address}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Overall Rating:</strong> {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings yet'}
                          </Typography>
                          
                          {store.userRating !== undefined && (
                            <Typography variant="body2">
                              <strong>Your Rating:</strong> {store.userRating !== null ? store.userRating : 'Not rated yet'}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/user/stores/${store.id}`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UserDashboard;

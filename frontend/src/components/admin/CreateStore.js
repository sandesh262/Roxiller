import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import storeService from '../../services/storeService';
import userService from '../../services/userService';

const CreateStore = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStoreOwners = async () => {
    try {
      // Get users with role 'store_owner' or 'user' (potential store owners)
      const response = await userService.getAllUsers({ role: 'store_owner' });
      const usersResponse = await userService.getAllUsers({ role: 'user' });
      
      // Combine store owners and normal users
      const owners = [
        ...response.users,
        ...usersResponse.users
      ];
      
      setStoreOwners(owners);
    } catch (error) {
      console.error('Failed to fetch store owners', error);
    } finally {
      setLoadingOwners(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Address validation: max 400 characters
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await storeService.createStore(formData);
      navigate('/admin/stores');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Store
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Store Name"
              name="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="address"
              label="Address"
              id="address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="owner-label">Store Owner (Optional)</InputLabel>
              <Select
                labelId="owner-label"
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                label="Store Owner (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {loadingOwners ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                    Loading users...
                  </MenuItem>
                ) : (
                  storeOwners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/stores')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Store'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateStore;

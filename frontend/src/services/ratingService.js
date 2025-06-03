// Only using testApi for direct test routes
import testApi from './testApi';

// Submit a rating for a store
export const submitRating = async (storeId, rating) => {
  try {
    console.log('Submitting rating:', { storeId, rating });
    const response = await testApi.post('/ratings', { storeId, rating });
    console.log('Rating submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

// Get all ratings for the current user
export const getUserRatings = async () => {
  try {
    const response = await testApi.get('/ratings/user');
    return response.data.ratings;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};

const ratingService = {
  submitRating,
  getUserRatings
};

export default ratingService;

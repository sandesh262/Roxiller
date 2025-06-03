import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Typography, Box, CircularProgress, CssBaseline } from '@mui/material';

// Auth Context Provider
import { AuthProvider, useAuth } from './utils/AuthContext';
import PrivateRoute from './utils/PrivateRoute';

// Common Components
import Navbar from './components/common/Navbar';
import Login from './components/common/Login';
import Register from './components/common/Register';

// Lazy load other components
const PasswordUpdate = lazy(() => import('./components/common/PasswordUpdate'));

// Admin Components
const AdminDashboard = lazy(() => import('./components/admin/Dashboard'));
const UserList = lazy(() => import('./components/admin/UserList'));
const CreateUser = lazy(() => import('./components/admin/CreateUser'));
const StoreList = lazy(() => import('./components/admin/StoreList'));
const CreateStore = lazy(() => import('./components/admin/CreateStore'));

// Store Owner Components
const StoreOwnerDashboard = lazy(() => import('./components/storeOwner/Dashboard'));
const StoreOwnerStoreDetails = lazy(() => import('./components/storeOwner/StoreDetails'));
const StoreOwnerCreateStore = lazy(() => import('./components/storeOwner/CreateStore'));

// Normal User Components
const UserDashboard = lazy(() => import('./components/user/Dashboard'));
const UserStoreDetails = lazy(() => import('./components/user/StoreDetails'));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <Box textAlign="center">
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  </Container>
);

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              There was an error loading this page. Please try refreshing or contact support.
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Home component that redirects based on user role
const Home = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'store_owner':
      return <Navigate to="/store-owner/dashboard" />;
    case 'user':
      return <Navigate to="/user/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Home Route - Redirects based on role */}
                <Route path="/" element={<Home />} />
                
                {/* Common Protected Routes */}
                <Route 
                  path="/password-update" 
                  element={
                    <PrivateRoute>
                      <PasswordUpdate />
                    </PrivateRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <UserList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/users/create" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <CreateUser />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/stores" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <StoreList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/stores/create" 
                  element={
                    <PrivateRoute requiredRole="admin">
                      <CreateStore />
                    </PrivateRoute>
                  } 
                />
                
                {/* Store Owner Routes */}
                <Route 
                  path="/store-owner/dashboard" 
                  element={
                    <PrivateRoute requiredRole="store_owner">
                      <StoreOwnerDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/store-owner/stores/:id" 
                  element={
                    <PrivateRoute requiredRole="store_owner">
                      <StoreOwnerStoreDetails />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/store-owner/stores/create" 
                  element={
                    <PrivateRoute requiredRole="store_owner">
                      <StoreOwnerCreateStore />
                    </PrivateRoute>
                  } 
                />
                
                {/* Normal User Routes */}
                <Route 
                  path="/user/dashboard" 
                  element={
                    <PrivateRoute requiredRole="user">
                      <UserDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/user/stores/:id" 
                  element={
                    <PrivateRoute requiredRole="user">
                      <UserStoreDetails />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

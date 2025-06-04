<<<<<<< HEAD
# Store Rating App

A full-stack application for store ratings with role-based access control.

## Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access Control**: Different permissions for admin, store owners, and regular users
- **Store Management**: Create and manage stores
- **Rating System**: Users can rate stores and view ratings
- **Dashboards**: Role-specific dashboards for different user types

## Tech Stack

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication

### Frontend
- React.js
- Axios for API calls
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=roxiller_rating_db
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
   ```
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Default Admin Credentials
- Email: admin@roxiller.com
- Password: Admin@123

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/update-password` - Update password (requires auth)
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create a new store (admin only)
- `POST /api/ratings` - Submit a rating
- `GET /api/ratings/user` - Get user ratings
=======
# Roxiller
>>>>>>> b174c7e448ced02a4c5ac0d2f93bc4081e5817a6

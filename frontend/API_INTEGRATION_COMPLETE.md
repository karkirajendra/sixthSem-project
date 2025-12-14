# 🚀 API Integration Guide - RoomSathi Frontend

## Overview

This guide covers the complete integration of the RoomSathi backend APIs with the React frontend application.

## 🔧 Setup & Configuration

### 1. Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

### 2. Backend Connection

Ensure your backend server is running on `http://localhost:5000` before testing the frontend.

## 📡 API Integration Status

### ✅ Authentication APIs

- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Logout**: Clears local storage
- **Forgot Password**: `POST /api/auth/forgot-password`
- **Reset Password**: `POST /api/auth/reset-password/:token`

**Integration**: `src/api/api.js` & `src/contexts/AuthContext.jsx`

### ✅ Property APIs

- **Get All Properties**: `GET /api/properties` (with filters)
- **Get Featured Properties**: `GET /api/properties/featured`
- **Get Property by ID**: `GET /api/properties/:id`
- **Create Property**: `POST /api/properties` (sellers only)
- **Update Property**: `PUT /api/properties/:id` (sellers only)
- **Delete Property**: `DELETE /api/properties/:id` (sellers only)
- **Get My Properties**: `GET /api/properties/my-properties` (sellers only)

**Integration**: `src/api/api.js`

### ✅ Wishlist APIs

- **Get Wishlist**: `GET /api/wishlist`
- **Add to Wishlist**: `POST /api/wishlist`
- **Remove from Wishlist**: `DELETE /api/wishlist/:propertyId`

**Integration**: `src/api/api.js`

### ✅ User Management APIs

- **Get Profile**: `GET /api/users/profile`
- **Update Profile**: `PUT /api/users/profile`
- **Get All Users**: `GET /api/users` (admin only)
- **Update User Status**: `PUT /api/users/:id/status` (admin only)

**Integration**: `src/api/api.js`

### ✅ CMS APIs

- **Get Page Content**: `GET /api/cms/pages/:slug`
- **Get Blog Posts**: `GET /api/cms/blog`
- **Get Blog Post**: `GET /api/cms/blog/:slug`
- **Get Blog Categories**: `GET /api/cms/blog/categories`
- **Get Blog Tags**: `GET /api/cms/blog/tags`
- **Create Page**: `POST /api/cms/pages` (admin only)
- **Update Page**: `PUT /api/cms/pages/:id` (admin only)
- **Create Blog Post**: `POST /api/cms/blog` (admin only)
- **Update Blog Post**: `PUT /api/cms/blog/:id` (admin only)

**Integration**: `src/api/cmsApi.js`

### ✅ Feedback APIs

- **Submit Feedback**: `POST /api/feedback`
- **Get Feedback**: `GET /api/feedback` (admin only)
- **Respond to Feedback**: `PUT /api/feedback/:id/respond` (admin only)

**Integration**: `src/api/api.js`

### ✅ Recommendation APIs

- **Get Recommendations**: `GET /api/properties/recommendations`
- **Get Personalized Recommendations**: `GET /api/properties/personalized`
- **Search Properties**: Enhanced search with filters

**Integration**: `src/api/recommendationApi.js`

### ✅ Admin APIs

- **Dashboard Stats**: `GET /api/admin/stats`
- **All System Operations**: Integrated across admin portal

**Integration**: `src/api/api.js` and admin components

## 🔒 Authentication System

### Token Management

- JWT tokens are stored in localStorage
- Automatically included in API requests via Authorization header
- Token validation on app startup
- Automatic logout on token expiration

### User Roles

- **Buyer**: Can browse, save favorites, and manage inquiries
- **Seller**: Can create/manage properties and respond to inquiries
- **Admin**: Full system access including user management

## 🛠 API Helper Functions

### Error Handling

All API calls include comprehensive error handling with fallback to mock data when backend is unavailable.

### Response Format

```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  message: "Error description"
}
```

### Headers Configuration

```javascript
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};
```

## 🔄 Fallback System

### Mock Data Fallback

When the backend is unavailable, the frontend automatically falls back to mock data to ensure the application remains functional during development and testing.

### Cache Implementation

- Session storage caching for search results
- Optimized API call patterns
- Reduced redundant requests

## 📱 Frontend Components Integration

### Updated Components

1. **Login/Register Forms**: Now use real authentication
2. **Property Listings**: Fetch from backend API
3. **Inquiries & Messaging**: Integrated with contact and chat features
4. **User Profile**: Real profile management
5. **Admin Portal**: Full backend integration
6. **Search & Filters**: Enhanced with backend search
7. **Wishlist**: Real-time wishlist management

### Usage Examples

#### Authentication

```javascript
import { useAuth } from '../contexts/AuthContext';

const { login, register, logout, currentUser } = useAuth();

// Login
const handleLogin = async (email, password) => {
  const result = await login(email, password);
  if (result.success) {
    console.log('Login successful');
  }
};
```

#### Property Operations

```javascript
import { getAllProperties, createProperty } from '../api/api';

// Fetch properties with filters
const fetchProperties = async () => {
  const result = await getAllProperties({
    location: 'Kathmandu',
    type: 'room',
    minPrice: 5000,
    maxPrice: 15000,
  });

  if (result.success) {
    setProperties(result.properties);
  }
};
```

## 🚨 Important Notes

### 1. Backend Dependency

- The frontend now requires the backend to be running for full functionality
- Mock data is used as fallback when backend is unavailable
- Always start the backend server before testing

### 2. Environment Configuration

- Update `.env` file with correct backend URL
- Ensure CORS is properly configured in backend
- Check network connectivity between frontend and backend

### 3. Authentication State

- Users need to log in again after integration
- Old localStorage data has been updated to new format
- JWT tokens have expiration times

### 4. Error Handling

- All API calls include try-catch blocks
- User-friendly error messages
- Graceful degradation when services are unavailable

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend CORS is configured correctly
   - Check API_URL in .env file

2. **Authentication Issues**

   - Clear localStorage if switching between old/new versions
   - Check token expiration

3. **API Connection**
   - Verify backend server is running on correct port
   - Check network connectivity
   - Verify API_URL configuration

### Debugging Tips

1. Check browser console for error messages
2. Verify backend server logs
3. Test API endpoints directly with Postman
4. Check localStorage for authentication tokens

## 🎯 Next Steps

1. **Start Backend Server**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Test Authentication**: Register/login with new accounts
4. **Verify API Integration**: Test all major features
5. **Review Error Handling**: Ensure graceful fallbacks work

## 📚 Documentation References

- Backend API Documentation: `backend/README.md`
- Frontend Component Guide: See individual component files
- Environment Configuration: `.env.example`

---

🎉 **Integration Complete!** Your RoomSathi frontend is now fully integrated with the backend API system.

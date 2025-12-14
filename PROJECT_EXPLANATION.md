# RoomSathi - Complete Project Explanation

## 📋 Project Overview

**RoomSathi** is a comprehensive property rental platform for Nepal, built as a college project (BCA 6th Semester). It's a full-stack web application that allows users to search, view, and book rental properties (rooms, flats, apartments) in Nepal.

---

## 🏗️ Project Architecture

The project follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (User Portal)                │
│  React + Vite + Tailwind CSS                            │
│  Port: 5173 (default)                                   │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│              ADMIN PORTAL (Admin Dashboard)              │
│  React + Vite + Tailwind CSS                            │
│  Port: 4100 (default)                                   │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (API Server)                  │
│  Node.js + Express.js                                    │
│  Port: 5000 (default)                                   │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
│  MongoDB (Mongoose ODM)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Room-Finder-App-main/
├── frontend/          # User-facing web application
├── adminportal/       # Admin dashboard application
├── backend/           # REST API server
└── node_modules/      # Shared dependencies
```

---

## 🔌 How Frontend & Backend Connect

### 1. **API Configuration**

#### Frontend (`frontend/src/config.js`)
```javascript
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
```
- Uses environment variable `VITE_APP_API_URL` or defaults to `http://localhost:5000`
- All API calls use this base URL

#### Admin Portal (`adminportal/src/utils/adminApi.js`)
```javascript
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
```
- Same configuration pattern
- Connects to the same backend server

### 2. **Backend CORS Configuration** (`backend/src/app.js`)

The backend allows requests from multiple origins:
```javascript
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',  // Frontend
      'http://localhost:4100',                             // Admin portal
      'http://localhost:3000',                             // Alternative ports
      'http://localhost:3001',
    ],
    credentials: true,
  })
);
```

### 3. **Authentication Flow**

#### How Authentication Works:

1. **User Login** (`frontend/src/api/api.js`):
   ```javascript
   POST http://localhost:5000/api/auth/login
   Body: { email, password }
   Response: { token, data: { user } }
   ```
   - Token is stored in `localStorage` as `'token'`
   - User data stored as `'user'` in `localStorage`

2. **Protected API Calls**:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

3. **Backend Verification** (`backend/src/middlewares/auth.js`):
   - Extracts token from `Authorization` header
   - Verifies JWT token
   - Attaches user info to `req.user`
   - Checks role permissions (buyer, seller, admin)

### 4. **API Endpoints Structure**

All backend routes are prefixed with `/api/`:

```
/api/auth/*          - Authentication (login, register, profile)
/api/users/*        - User management
/api/properties/*   - Property CRUD operations
/api/wishlist/*     - Wishlist management
/api/admin/*        - Admin-only operations
/api/cms/*          - Content management
/api/feedback/*     - Feedback system
/api/contacts/*     - Contact form submissions
/api/reports/*      - Property reports
/api/images/*       - Image uploads
```

---

## 🎯 Key Components & Their Functions

### **Frontend (User Portal)**

#### Main Files:
- **`src/App.jsx`**: Main router, defines all routes
- **`src/api/api.js`**: All API communication functions
- **`src/config.js`**: API URL configuration
- **`src/contexts/AuthContext.jsx`**: Global authentication state

#### Key Features:
1. **Public Pages**:
   - Home page with featured properties
   - Property listing/search page
   - Property detail page
   - Login/Register pages
   - CMS pages (About, Blog, Privacy, Terms)

2. **Buyer Dashboard** (`/buyer/*`):
   - View wishlist
   - Browse properties
   - View messages
   - Manage profile

3. **Seller Dashboard** (`/seller/*`):
   - Add/Edit properties
   - View listings
   - Manage profile
   - View messages/inquiries

#### API Integration Example:
```javascript
// Getting all properties
const response = await fetch(`${API_URL}/api/properties`, {
  headers: createHeaders(false)  // false = no auth needed
});

// Creating a property (requires auth)
const response = await fetch(`${API_URL}/api/properties`, {
  method: 'POST',
  headers: createHeaders(true),  // true = include auth token
  body: JSON.stringify(propertyData)
});
```

---

### **Admin Portal**

#### Main Files:
- **`src/App.jsx`**: Admin router with protected routes
- **`src/utils/adminApi.js`**: Admin-specific API functions
- **`src/context/AppContext.jsx`**: Global admin state management

#### Key Features:
1. **Dashboard**: Statistics, analytics, recent listings
2. **User Management**: View, edit, delete users
3. **Property Management**: Approve, reject, feature properties
4. **CMS Management**: Create/edit pages and blog posts
5. **Feedback Management**: View and respond to user feedback
6. **Analytics**: View site analytics and reports

#### Authentication:
- Uses same backend auth system
- Requires `role: 'admin'` in user object
- Auto-login test endpoint: `/api/admin/test-login`

---

### **Backend (API Server)**

#### Main Files:
- **`src/index.js`**: Server entry point
- **`src/app.js`**: Express app setup, middleware, routes
- **`src/config/database.js`**: MongoDB connection
- **`src/routes/*.js`**: Route definitions
- **`src/controllers/*.js`**: Business logic
- **`src/models/*.js`**: Database models (Mongoose schemas)
- **`src/middlewares/*.js`**: Authentication, validation, error handling

#### Key Middlewares:

1. **Authentication** (`src/middlewares/auth.js`):
   - `protect`: Verifies JWT token
   - `roleAuth('admin')`: Ensures user has admin role

2. **Validation** (`src/middlewares/validation.js`):
   - Validates request data using express-validator
   - Returns error messages if validation fails

3. **Error Handling** (`src/middlewares/errorMiddleware.js`):
   - Catches all errors
   - Returns consistent error response format

#### Database Models:

1. **User** (`src/models/user.js`):
   - Fields: name, email, password (hashed), role, profile, status
   - Roles: 'buyer', 'seller', 'admin'

2. **Property** (`src/models/Property.js`):
   - Fields: title, description, price, type, location, images, seller, status
   - Types: 'room', 'flat', 'apartment', etc.

3. **Wishlist** (`src/models/Wishlist.js`):
   - Links users to properties they saved

4. **Feedback** (`src/models/Feedback.js`):
   - User feedback and reviews

5. **Analytics** (`src/models/Analytics.js`):
   - Tracks site visits, user behavior

---

## 🔄 Data Flow Examples

### Example 1: User Views Properties

```
1. Frontend: User visits /properties page
2. Frontend: Calls getAllProperties() from api.js
3. Frontend: Makes GET request to http://localhost:5000/api/properties
4. Backend: Receives request at /api/properties route
5. Backend: propertyController.getAllProperties() executes
6. Backend: Queries MongoDB for properties
7. Backend: Returns JSON: { success: true, data: [...properties] }
8. Frontend: Receives data, displays in UI
```

### Example 2: Seller Adds Property

```
1. Frontend: Seller fills form in /seller/add-property
2. Frontend: Calls createProperty(propertyData)
3. Frontend: Makes POST request with Authorization header
4. Backend: protect middleware verifies JWT token
5. Backend: Checks if user.role === 'seller'
6. Backend: propertyController.createProperty() executes
7. Backend: Validates data, saves to MongoDB
8. Backend: Returns { success: true, data: newProperty }
9. Frontend: Shows success message, redirects to listings
```

### Example 3: Admin Views Dashboard

```
1. Admin Portal: Admin logs in
2. Admin Portal: Stores token in localStorage
3. Admin Portal: Calls adminApi.getDashboardStats()
4. Admin Portal: Makes GET request with Authorization header
5. Backend: protect + roleAuth('admin') verify admin access
6. Backend: adminController.getDashboardStats() executes
7. Backend: Aggregates data from MongoDB (users, properties, etc.)
8. Backend: Returns statistics
9. Admin Portal: Displays stats in dashboard
```

---

## 🔐 Security Features

1. **JWT Authentication**: Tokens expire after 30 days (configurable)
2. **Password Hashing**: Uses bcrypt to hash passwords
3. **Role-Based Access Control**: Different permissions for buyer/seller/admin
4. **Rate Limiting**: Prevents API abuse (100 requests per 15 minutes)
5. **Input Validation**: All inputs validated before processing
6. **CORS Protection**: Only allows requests from whitelisted origins
7. **Security Headers**: Helmet.js adds security headers

---

## 📦 Key Dependencies

### Frontend:
- **React**: UI library
- **React Router**: Client-side routing
- **Axios/Fetch**: HTTP requests
- **Tailwind CSS**: Styling
- **React Hot Toast**: Notifications

### Admin Portal:
- **React**: UI library
- **React Router**: Routing
- **Recharts**: Charts/analytics
- **React Quill**: Rich text editor (for CMS)

### Backend:
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **Multer**: File uploads
- **Cloudinary**: Image hosting
- **Nodemailer**: Email sending
- **Express Validator**: Input validation

---

## 🌐 Environment Variables

### Frontend (.env):
```env
VITE_APP_API_URL=http://localhost:5000
```

### Admin Portal (.env):
```env
VITE_APP_API_URL=http://localhost:5000
```

### Backend (.env):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/roomsathi
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🚀 Running the Project

### 1. Start Backend:
```bash
cd backend
npm install
npm run dev  # Runs on port 5000
```

### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### 3. Start Admin Portal:
```bash
cd adminportal
npm install
npm run dev  # Runs on port 4100
```

### 4. Start MongoDB:
Make sure MongoDB is running on your system (default: `mongodb://localhost:27017`)

---

## 📊 Database Schema Overview

### Collections:
1. **users**: User accounts (buyers, sellers, admins)
2. **properties**: Property listings
3. **wishlists**: User saved properties
4. **feedbacks**: User feedback/reviews
5. **analytics**: Site analytics data
6. **cmspages**: CMS pages and blog posts
7. **contacts**: Contact form submissions
8. **reports**: Property reports

---

## 🔗 Important Connections Summary

1. **Frontend ↔ Backend**: 
   - Base URL: `http://localhost:5000`
   - All API calls go through `/api/*` routes
   - Authentication via JWT tokens in headers

2. **Admin Portal ↔ Backend**:
   - Same backend server
   - Uses `/api/admin/*` routes
   - Requires admin role

3. **Backend ↔ MongoDB**:
   - Connection string in `MONGO_URI`
   - Mongoose handles all database operations
   - Models define schema structure

4. **Image Uploads**:
   - Frontend uploads to `/api/images/upload-single` or `/api/images/upload-multiple`
   - Backend uses Multer to receive files
   - Files uploaded to Cloudinary
   - Returns Cloudinary URL to frontend

---

## 🎓 Learning Points

1. **RESTful API Design**: Clean endpoint structure
2. **JWT Authentication**: Token-based auth system
3. **Role-Based Access Control**: Different permissions per role
4. **State Management**: React Context API for global state
5. **Protected Routes**: Route guards for authentication
6. **File Uploads**: Handling multipart/form-data
7. **Error Handling**: Consistent error responses
8. **API Caching**: Admin portal caches API responses
9. **Environment Configuration**: Using .env files

---

## 📝 Notes

- The project uses **localStorage** for client-side token storage
- Admin portal has a test-login endpoint for development
- Both frontends can run simultaneously (different ports)
- Backend serves as a single API for both frontends
- MongoDB connection is established at server startup
- All sensitive data (passwords, tokens) are hashed/encrypted

---

This is a complete full-stack application demonstrating modern web development practices with React, Node.js, and MongoDB!

# RoomSathi Backend API

A comprehensive RESTful API for the RoomSathi property rental platform built with Node.js, Express.js, and MongoDB.

## Features

- **User Management**: Registration, login, profile management with role-based access (buyer, seller, admin)
- **Property Management**: CRUD operations for properties with advanced filtering and search
- **Booking System**: Complete booking workflow with payment processing
- **Wishlist**: Users can save favorite properties
- **CMS**: Content management for pages and blog posts
- **Feedback System**: User feedback and review management
- **Admin Dashboard**: Complete admin panel with analytics
- **Security**: JWT authentication, rate limiting, input validation
- **File Upload**: Image upload with Cloudinary integration
- **Email Service**: Transactional emails for notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Environment**: dotenv

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middlewares
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── app.js          # Express app setup
│   └── index.js        # Server entry point
├── uploads/            # File uploads directory
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the application**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/roomsathi
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout
- `GET /api/auth/dashboard-stats` - Get dashboard statistics

### Properties

- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/search` - Search properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (seller only)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/my/properties` - Get seller's properties

### Bookings

- `POST /api/bookings` - Create booking (buyer only)
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/payment` - Process payment
- `POST /api/bookings/:id/notes` - Add booking note

### Wishlist

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/:propertyId` - Add to wishlist
- `DELETE /api/wishlist/:propertyId` - Remove from wishlist
- `GET /api/wishlist/check/:propertyId` - Check wishlist status

### CMS

- `GET /api/cms/pages` - Get CMS pages
- `GET /api/cms/pages/:slug` - Get page by slug
- `POST /api/cms/pages` - Create page (admin only)
- `PUT /api/cms/pages/:id` - Update page (admin only)
- `DELETE /api/cms/pages/:id` - Delete page (admin only)
- `GET /api/cms/blog` - Get blog posts
- `GET /api/cms/blog/:slug` - Get blog post by slug

### Feedback

- `POST /api/feedback` - Create feedback
- `GET /api/feedback/my-feedback` - Get user's feedback
- `GET /api/feedback/:id` - Get single feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/feedback` - Get all feedback
- `PUT /api/admin/feedback/:id/status` - Update feedback status

## Data Models

### User

- Basic info (name, email, password)
- Role (buyer, seller, admin)
- Profile information
- Preferences and verification status

### Property

- Property details (title, description, type, price)
- Location and area information
- Features and amenities
- Images and seller information
- View tracking

### Booking

- Property and user references
- Contact and booking details
- Payment information
- Status tracking
- Notes and communication

### Wishlist

- User and property references
- Timestamp tracking

### CMS Page & Blog Post

- Content management
- SEO metadata
- Publishing workflow

### Feedback

- User feedback and reviews
- Admin response system
- Priority and status tracking

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for buyers, sellers, and admins
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **Password Hashing**: Secure password storage with bcrypt
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet.js for security headers

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Validation errors if any
}
```

## Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "data": {...}, // Response data
  "count": 10,   // For list endpoints
  "total": 100,  // Total count for pagination
  "totalPages": 10,
  "currentPage": 1
}
```

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please contact the development team.

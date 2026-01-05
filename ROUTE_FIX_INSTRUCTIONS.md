# Image Upload Route Fix

## Issue
The route `/api/images/upload-single` is returning "Not found" error.

## Solution Applied
1. Added a test route to verify the router is working
2. Added logging to debug route matching

## Steps to Fix

### 1. Restart the Backend Server
The routes need to be reloaded. Stop and restart your backend server:

```bash
cd backend
# Stop the server (Ctrl+C if running)
npm run dev
```

### 2. Test the Route
First, test if the router is working:

```bash
# Test route (no auth required)
curl http://localhost:5000/api/images/test
```

You should get:
```json
{
  "success": true,
  "message": "Image routes are working",
  "path": "/api/images/test"
}
```

### 3. Verify Authentication
The `/upload-single` route requires:
- Valid JWT token in Authorization header
- User role must be 'admin' or 'seller'

Make sure you're:
1. Logged in as a seller or admin
2. Sending the token in the request header:
   ```
   Authorization: Bearer <your-token>
   ```

### 4. Test Upload with Authentication
```bash
curl -X POST http://localhost:5000/api/images/upload-single \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/your/image.jpg"
```

## Common Issues

### Issue 1: Route Not Found
- **Cause**: Server not restarted after route changes
- **Fix**: Restart the backend server

### Issue 2: Not Authorized
- **Cause**: Missing or invalid token, or wrong user role
- **Fix**: 
  - Make sure you're logged in
  - Check your user role is 'seller' or 'admin'
  - Verify token is in Authorization header

### Issue 3: File Upload Error
- **Cause**: File too large (>5MB) or wrong file type
- **Fix**: 
  - Use image files only (jpg, png, etc.)
  - Keep file size under 5MB

## Verification

After restarting, check the server logs. You should see:
```
Created uploads directory
🚀 Server running in development mode on port 5000
```

Then test the route with proper authentication.

# RoomSathi - Complete Code Explanation & Fixes

## 🔧 **FIXES APPLIED**

### ✅ **1. Registration Issue Fixed**
**Problem**: Registration was making duplicate API calls - one direct fetch and one through AuthContext, causing "user already exists" error.

**Fix Applied**: Removed the duplicate direct fetch call in `frontend/src/pages/auth/RegisterPage.jsx`. Now it only uses the `register()` function from AuthContext.

**Location**: `frontend/src/pages/auth/RegisterPage.jsx` (lines 63-87)

---

### ✅ **2. Photo Upload Issue Fixed**
**Problem**: Multer was trying to save files to `uploads/` directory that didn't exist, causing "no such file or directory" error.

**Fix Applied**: Added directory creation logic in `backend/src/routes/imageRoutes.js` to ensure `uploads/` directory exists before saving files.

**Location**: `backend/src/routes/imageRoutes.js` (lines 13-20)

---

### ✅ **3. Search Enhancement**
**Problem**: Search wasn't recognizing property types from search queries.

**Fix Applied**: Enhanced search in `backend/src/controllers/propertyController.js` to:
- Map common search terms to property types (room, flat, apartment, etc.)
- Search in additional fields (address.city, address.street, address.state)
- Better type matching from search queries

**Location**: `backend/src/controllers/propertyController.js` (lines 305-340)

---

## 📚 **COMPLETE CODE EXPLANATION**

---

## 🗺️ **MAP INTEGRATION**

### **Location**: `frontend/src/pages/seller/AddProperty.jsx`

### **How It Works**:

#### **1. Map Library Used**
- **Leaflet.js** - Open-source JavaScript library for interactive maps
- Imported via CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`

```javascript
// Line 23-28
import L from 'leaflet';
const leafletCSS = `
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
`;
```

#### **2. Map Initialization**
```javascript
// Lines 68-70: Refs for map management
const mapRef = useRef(null);
const mapInstanceRef = useRef(null);
const markerRef = useRef(null);
```

#### **3. Geocoding Services**

**A. Forward Geocoding** (Address → Coordinates):
```javascript
// Lines 31-42
const geocodeWithNominatim = async (query) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Nepal&limit=5`
  );
  return data; // Returns array of location results
};
```
- Uses **Nominatim** (free OpenStreetMap service)
- Converts address text to coordinates
- Returns up to 5 matching locations

**B. Reverse Geocoding** (Coordinates → Address):
```javascript
// Lines 44-55
const reverseGeocodeWithNominatim = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  return data; // Returns address details
};
```
- Converts map click coordinates to readable address
- Used when user clicks on map to select location

#### **4. Map Click Handler**
```javascript
// Lines 223-267
const handleMapClick = useCallback(async (lat, lng) => {
  // 1. Set selected location coordinates
  setSelectedLocation([lat, lng]);
  
  // 2. Remove old marker if exists
  if (markerRef.current) {
    mapInstanceRef.current.removeLayer(markerRef.current);
  }
  
  // 3. Add new marker at clicked location
  markerRef.current = L.marker([lat, lng])
    .addTo(mapInstanceRef.current)
    .bindPopup('Selected Location')
    .openPopup();
  
  // 4. Reverse geocode to get address
  const addressData = await reverseGeocodeWithNominatim(lat, lng);
  
  // 5. Update property data with address
  setPropertyData(prev => ({
    ...prev,
    location: shortLocation,
    address: {
      street: addressData.address?.road,
      city: addressData.address?.city,
      state: addressData.address?.state,
    }
  }));
}, []);
```

#### **5. Current Location Detection**
```javascript
// Lines 383-410
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Update map center
        setMapCenter([lat, lng]);
        
        // Auto-select location
        await handleMapClick(lat, lng);
      }
    );
  }
};
```
- Uses browser's **Geolocation API**
- Gets user's current GPS location
- Automatically centers map and selects location

#### **6. Address Search**
```javascript
// Lines 475-522
const handleAddressSearch = async () => {
  // 1. Use backend geocoding API
  const result = await geocodeAddress(propertyData.location.trim());
  
  // 2. Get coordinates from result
  const { coordinates: coords } = result;
  
  // 3. Update map center
  setMapCenter([coords.latitude, coords.longitude]);
  
  // 4. Add marker to map
  markerRef.current = L.marker([lat, lng])
    .addTo(mapInstanceRef.current);
};
```

#### **7. Map Display**
- Map is shown in a modal/expanded view
- Default center: Kathmandu, Nepal (27.7172, 85.3240)
- Users can:
  - Click on map to select location
  - Search by address
  - Use current location button
  - Manually enter coordinates

---

## 💬 **CHAT SYSTEM**

### **Architecture**: REST API + WebSocket for Real-time

### **Frontend Components**:

#### **1. Chat Modal** (`frontend/src/components/ChatModal.jsx`)

**Purpose**: Modal dialog for buyer-seller communication about a property

**Key Features**:
- Real-time messaging via WebSocket
- Message read receipts
- Typing indicators
- Auto-scroll to latest message

**Initialization**:
```javascript
// Lines 27-66
useEffect(() => {
  const initializeChat = async () => {
    // 1. Get or create chat room
    const room = await getOrCreateChatRoom(propertyId, sellerId);
    setChatRoom(room);
    
    // 2. Fetch existing messages
    const chatMessages = await getMessages(room._id);
    setMessages(chatMessages);
    
    // 3. Mark messages as read
    await markMessagesAsRead(room._id);
    
    // 4. Initialize WebSocket for real-time updates
    initializeWebSocket(room._id);
  };
  
  if (currentUser && sellerId) {
    initializeChat();
  }
}, [currentUser, propertyId, sellerId]);
```

#### **2. WebSocket Connection** (`frontend/src/components/ChatModal.jsx`)

**Connection Setup**:
```javascript
// Lines 68-127
const initializeWebSocket = (roomId) => {
  // WebSocket URL with room and user info
  const wsUrl = `ws://localhost:5000?roomId=${roomId}&userId=${currentUser.id}`;
  wsRef.current = new WebSocket(wsUrl);
  
  // On connection open
  wsRef.current.onopen = () => {
    console.log('WebSocket connected');
  };
  
  // On receiving message
  wsRef.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'new_message') {
      // Add new message to list
      setMessages(prev => [...prev, data.message]);
    } else if (data.type === 'user_typing') {
      // Show typing indicator
      setIsTyping(true);
    } else if (data.type === 'message_read') {
      // Update read status
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, read: true } : msg
      ));
    }
  };
  
  // Auto-reconnect on close
  wsRef.current.onclose = () => {
    setTimeout(() => {
      initializeWebSocket(roomId); // Reconnect after 3 seconds
    }, 3000);
  };
};
```

**Message Types**:
- `new_message` - New message received
- `user_typing` - User is typing
- `message_read` - Message was read

#### **3. Sending Messages**

**Via REST API** (Primary):
```javascript
// Lines 139-165
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  const newMessage = {
    text: messageText,
    roomId: chatRoom._id,
    receiverId: sellerId,
    propertyId: propertyId,
  };
  
  // Send via REST API
  const sentMessage = await sendMessage(newMessage);
  
  // Add to UI immediately (optimistic update)
  setMessages(prev => [...prev, sentMessage]);
};
```

**Typing Indicator**:
```javascript
// Lines 167-176
const handleTyping = () => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'typing',
      roomId: chatRoom._id,
      userId: currentUser.id,
      userName: currentUser.name
    }));
  }
};
```

#### **4. Chat API Functions** (`frontend/src/api/chat.js`)

**Get or Create Chat Room**:
```javascript
// Lines 26-34
export const getOrCreateChatRoom = async (propertyId, sellerId, buyerId = null) => {
  const response = await api.post('/room', { 
    propertyId, 
    sellerId, 
    buyerId 
  });
  return response.data; // Returns chat room object
};
```

**Get Messages**:
```javascript
// Lines 37-40
export const getMessages = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/messages`);
  return response.data; // Returns array of messages
};
```

**Send Message**:
```javascript
// Lines 43-57
export const sendMessage = async (messageData) => {
  const response = await api.post('/message', {
    text: messageData.text,
    receiverId: messageData.receiverId,
    roomId: messageData.roomId,
    propertyId: messageData.propertyId
  });
  return response.data; // Returns sent message
};
```

**Mark as Read**:
```javascript
// Lines 79-82
export const markMessagesAsRead = async (roomId) => {
  const response = await api.post('/messages/read', { roomId });
  return response.data;
};
```

#### **5. Seller Chat** (`frontend/src/components/SellerChat.jsx`)

**Purpose**: Seller's view of all their property chats

**Features**:
- List all chat rooms for seller's properties
- Group chats by property
- View unread message counts
- Quick reply functionality

**Loading Chats**:
```javascript
// Lines 38-51
const loadChatData = async () => {
  const [rooms, propertyChatsData] = await Promise.all([
    getSellerChatRooms(),      // All chat rooms
    getSellerPropertyChats()   // Grouped by property
  ]);
  setChatRooms(rooms);
  setPropertyChats(propertyChatsData);
};
```

#### **6. Buyer Messages** (`frontend/src/pages/buyer/BuyerMessages.jsx`)

**Purpose**: Buyer's inbox of all conversations

**Features**:
- List all chat rooms buyer is part of
- Filter by property
- Unread message indicators
- Quick access to property details

---

## 🔐 **AUTHENTICATION SYSTEM**

### **Flow**:

#### **1. Registration** (`backend/src/controllers/auth.js`)

```javascript
// Lines 9-33
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // 1. Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }
  
  // 2. Create user (password auto-hashed by mongoose middleware)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'buyer',
  });
  
  // 3. Generate JWT token and send response
  generateToken(user, 201, res);
});
```

**Password Hashing** (in User model):
```javascript
// Auto-hashes password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

#### **2. Login** (`backend/src/controllers/auth.js`)

```javascript
// Lines 38-76
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find user with password field
  const user = await User.findOne({ email }).select('+password');
  
  // 2. Check password
  const isMatch = await user.comparePassword(password);
  
  // 3. Handle failed attempts (account locking)
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // 4. Reset attempts on success
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  // 5. Update last login and generate token
  user.lastLogin = new Date();
  await user.save();
  generateToken(user, 200, res);
});
```

#### **3. JWT Token Generation** (`backend/src/utils/generateToken.js`)

```javascript
const generateToken = (user, statusCode, res) => {
  // 1. Create JWT payload
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
  
  // 2. Set HTTP-only cookie (optional)
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  
  res.cookie('token', token, options);
  
  // 3. Send response with token
  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};
```

#### **4. Protected Routes** (`backend/src/middlewares/auth.js`)

```javascript
// Lines: protect middleware
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // 1. Get token from header or cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  
  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Get user from database
  req.user = await User.findById(decoded.id);
  
  next();
});

// Role-based authorization
export const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error('Not authorized for this action');
    }
    next();
  };
};
```

---

## 📸 **IMAGE UPLOAD SYSTEM**

### **Flow**:

#### **1. Frontend Upload** (`frontend/src/api/api.js`)

```javascript
// Lines 820-838
export const uploadSingleImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_URL}/api/images/upload-single`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      // Don't set Content-Type - browser sets it with boundary
    },
    body: formData, // FormData for multipart/form-data
  });
  
  const data = await handleApiResponse(response);
  return { success: true, imageUrl: data.data.url };
};
```

#### **2. Backend Receives File** (`backend/src/routes/imageRoutes.js`)

```javascript
// Lines 44-50
router.post(
  '/upload-single',
  protect,                    // Require authentication
  roleAuth('admin', 'seller'), // Only admin/seller can upload
  upload.single('image'),      // Multer middleware handles file
  uploadImage                 // Controller processes file
);
```

#### **3. Multer Configuration** (`backend/src/routes/imageRoutes.js`)

```javascript
// Lines 14-41
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir); // Save to 'uploads/' directory
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'), false);
    }
  },
});
```

#### **4. Upload to Cloudinary** (`backend/src/controllers/imageController.js`)

```javascript
// Lines 10-44
export const uploadImage = async (req, res) => {
  // 1. Check file exists
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  
  // 2. Upload to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.path, {
    folder: 'sajilo-basai/properties',
  });
  
  // 3. Delete local file after upload
  fs.unlinkSync(req.file.path);
  
  // 4. Return Cloudinary URL
  res.json({
    success: true,
    data: {
      url: uploadResult.url,        // Public URL
      publicId: uploadResult.publicId, // For deletion
    },
  });
};
```

#### **5. Cloudinary Configuration** (`backend/src/config/cloudinary.js`)

```javascript
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, options = {}) => {
  const result = await cloudinary.v2.uploader.upload(filePath, {
    folder: options.folder || 'uploads',
    resource_type: 'image',
  });
  
  return {
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  };
};
```

**Process**:
1. File saved temporarily to `uploads/` directory
2. Uploaded to Cloudinary cloud storage
3. Local file deleted
4. Cloudinary URL returned to frontend
5. Frontend stores URL in property data

---

## 🔍 **SEARCH SYSTEM**

### **Backend Search** (`backend/src/controllers/propertyController.js`)

#### **1. Basic Search** (`getAllProperties`)

```javascript
// Lines 9-88
export const getAllProperties = asyncHandler(async (req, res) => {
  const { location, type, minPrice, maxPrice, roomType, flatType, search } = req.query;
  
  let query = { status: 'available' };
  
  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' }; // Case-insensitive
  }
  
  // Type filter
  if (type) {
    query.type = type; // Exact match: 'room', 'flat', 'apartment'
  }
  
  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }
  
  // Room type (for room properties)
  if (roomType) {
    query.roomType = roomType; // 'single', 'double', 'studio'
  }
  
  // Flat type (for flat properties)
  if (flatType) {
    query.flatType = flatType; // '1bhk', '2bhk', '3bhk'
  }
  
  // Text search
  if (search) {
    query.$text = { $search: search }; // MongoDB text search
  }
  
  // Execute query with pagination
  const properties = await Property.find(query)
    .populate('sellerId', 'name email')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit);
  
  res.json({
    success: true,
    data: properties,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});
```

#### **2. Enhanced Search** (`searchProperties`)

```javascript
// Lines 287-424
export const searchProperties = asyncHandler(async (req, res) => {
  const { q, location, type, minPrice, maxPrice } = req.query;
  
  let query = { status: 'available' };
  
  // Enhanced text search
  if (q) {
    const searchTerms = q.toLowerCase().split(' ').filter(term => term.length > 1);
    
    // Type mapping
    const typeMapping = {
      'room': 'room',
      'flat': 'flat',
      'apartment': 'apartment',
      'house': 'house',
      'studio': 'studio',
    };
    
    // Check if search term matches a type
    let matchedType = null;
    for (const term of searchTerms) {
      if (typeMapping[term]) {
        matchedType = typeMapping[term];
        break;
      }
    }
    
    // Create search patterns
    const searchPatterns = searchTerms.map(term => ({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { 'address.city': { $regex: term, $options: 'i' } },
        { 'address.street': { $regex: term, $options: 'i' } },
      ],
    }));
    
    if (matchedType && !type) {
      query.type = matchedType;
    }
    
    if (searchPatterns.length > 0) {
      query.$and = searchPatterns;
    }
    
    // Price pattern matching
    // "under 5000", "over 10000", "5000-10000"
    const priceMatch = q.match(/(\d+)\s*-\s*(\d+)/);
    if (priceMatch) {
      query.price = {
        $gte: parseInt(priceMatch[1]),
        $lte: parseInt(priceMatch[2]),
      };
    }
  }
  
  // Execute search
  const properties = await Property.find(query)
    .populate('sellerId')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit);
  
  res.json({ success: true, data: properties });
});
```

#### **3. Frontend Search** (`frontend/src/pages/properties/PropertiesPage.jsx`)

```javascript
// Search handler
const handleSearch = async (searchParams) => {
  setLoading(true);
  
  try {
    // Call search API
    const result = await searchProperties({
      q: searchParams.search,
      location: searchParams.location,
      type: searchParams.type,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
    });
    
    setProperties(result.properties);
    setTotalPages(result.totalPages);
  } catch (error) {
    toast.error('Search failed');
  } finally {
    setLoading(false);
  }
};
```

**Search Features**:
- Text search in title, description, location
- Type filtering (room, flat, apartment)
- Price range filtering
- Location-based search
- Room/Flat type filtering
- Pagination support

---

## 🏗️ **PROPERTY MANAGEMENT**

### **Creating Property** (`frontend/src/pages/seller/AddProperty.jsx`)

#### **1. Form State**
```javascript
// Lines 72-100
const [propertyData, setPropertyData] = useState({
  title: '',
  description: '',
  price: '',
  type: 'room',
  roomType: '',      // For rooms: 'single', 'double', 'studio'
  flatType: '',      // For flats: '1bhk', '2bhk', '3bhk'
  location: '',
  area: '',
  bedrooms: 0,
  bathrooms: 0,
  images: [],        // Array of image URLs
  features: {
    electricity: false,
    parking: false,
    wifi: false,
    // ... more features
  },
  amenities: [],     // Array of strings
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
});
```

#### **2. Image Upload**
```javascript
// Lines: Image upload handler
const handleImageUpload = async (files) => {
  setUploadingImages(true);
  
  try {
    // Upload multiple images
    const result = await uploadMultipleImages(files);
    
    // Add URLs to property data
    setPropertyData(prev => ({
      ...prev,
      images: [...prev.images, ...result.imageUrls]
    }));
    
    toast.success('Images uploaded successfully');
  } catch (error) {
    toast.error('Failed to upload images');
  } finally {
    setUploadingImages(false);
  }
};
```

#### **3. Submit Property**
```javascript
// Lines: Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Validate required fields
    if (!propertyData.title || !propertyData.location) {
      throw new Error('Title and location are required');
    }
    
    // Create property via API
    const result = await createProperty(propertyData);
    
    if (result.success) {
      toast.success('Property listed successfully!');
      navigate(`/seller/property/${result.property._id}`);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### **4. Backend Property Creation** (`backend/src/controllers/propertyController.js`)

```javascript
// Create property controller
export const createProperty = asyncHandler(async (req, res) => {
  const {
    title, description, price, type, location,
    images, features, amenities, address
  } = req.body;
  
  // Create property
  const property = await Property.create({
    title,
    description,
    price,
    type,
    location,
    images,
    features,
    amenities,
    address,
    sellerId: req.user.id, // From authenticated user
    status: 'available',
  });
  
  res.status(201).json({
    success: true,
    data: property,
  });
});
```

---

## 📊 **DATA MODELS**

### **User Model** (`backend/src/models/user.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer' 
  },
  profile: {
    avatar: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
});
```

### **Property Model** (`backend/src/models/Property.js`)

```javascript
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['room', 'flat', 'apartment', 'house', 'studio'],
    required: true 
  },
  roomType: { 
    type: String,
    enum: ['single', 'double', 'studio', 'single-kitchen'],
  },
  flatType: {
    type: String,
    enum: ['1bhk', '2bhk', '3bhk', '2bhk-duplex'],
  },
  location: { type: String, required: true },
  area: { type: Number },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  images: [{ type: String }],
  features: {
    electricity: Boolean,
    parking: Boolean,
    wifi: Boolean,
    security: Boolean,
    furnished: Boolean,
  },
  amenities: [{ type: String }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'rented', 'sold'],
    default: 'available',
  },
  views: {
    total: { type: Number, default: 0 },
    loggedIn: { type: Number, default: 0 },
    anonymous: { type: Number, default: 0 },
  },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
```

---

## 🔄 **API ROUTES STRUCTURE**

### **Backend Routes** (`backend/src/app.js`)

```javascript
// Lines 85-94
app.use('/api/auth', authRoutes);        // Authentication
app.use('/api/users', userRoutes);       // User management
app.use('/api/properties', propertyRoutes); // Properties
app.use('/api/wishlist', wishlistRoutes);   // Wishlist
app.use('/api/cms', cmsRoutes);          // CMS pages
app.use('/api/feedback', feedbackRoutes);   // Feedback
app.use('/api/admin', adminRoutes);     // Admin operations
app.use('/api/contacts', contactRoutes); // Contact form
app.use('/api/reports', reportRoutes);   // Property reports
app.use('/api/images', imageRoutes);     // Image uploads
```

### **Frontend API Base** (`frontend/src/config.js`)

```javascript
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
export { API_URL };
```

**All API calls use this base URL**:
- `GET ${API_URL}/api/properties` - Get all properties
- `POST ${API_URL}/api/auth/register` - Register user
- `POST ${API_URL}/api/images/upload-single` - Upload image

---

## 🎯 **KEY FEATURES SUMMARY**

1. **Authentication**: JWT-based with role-based access control
2. **Property Management**: Full CRUD with image uploads
3. **Search**: Advanced filtering and text search
4. **Map Integration**: Leaflet.js with geocoding
5. **Chat System**: REST API + WebSocket for real-time messaging
6. **Image Upload**: Multer → Cloudinary cloud storage
7. **Wishlist**: Save favorite properties
8. **Admin Dashboard**: Complete admin panel
9. **CMS**: Content management for pages/blog
10. **Analytics**: Track views and user behavior

---

## 🚀 **RUNNING THE APPLICATION**

### **Backend**:
```bash
cd backend
npm install
npm run dev  # Runs on port 5000
```

### **Frontend**:
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### **Admin Portal**:
```bash
cd adminportal
npm install
npm run dev  # Runs on port 4100
```

### **Environment Variables**:

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/roomsathi
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend** (`.env`):
```env
VITE_APP_API_URL=http://localhost:5000
```

---

## 📝 **NOTES**

- **WebSocket Server**: Currently, the chat system expects a WebSocket server at `ws://localhost:5000`, but I don't see the server implementation in the backend. You may need to add a WebSocket server using `ws` or `socket.io` package.

- **File Uploads**: The `uploads/` directory is now automatically created, but files are deleted after uploading to Cloudinary.

- **Search Enhancement**: Search now recognizes property types from text queries (e.g., "room in Kathmandu" will filter by type=room and location=Kathmandu).

- **Registration Fix**: Removed duplicate API call that was causing "user already exists" error.

---

This document covers all major components of the RoomSathi application. Each section explains the code flow, key functions, and how different parts connect together.

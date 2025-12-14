import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter property title'],
    maxLength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please enter property description'],
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    required: [true, 'Please select property type'],
    enum: ['room', 'flat', 'apartment', 'house'],
  },
  roomType: {
    type: String,
    required: function () {
      return this.type === 'room';
    },
    enum: ['single', 'double', 'studio', 'single-kitchen'],
  },
  flatType: {
    type: String,
    required: function () {
      return this.type === 'flat' || this.type === 'apartment';
    },
    enum: ['1bhk', '2bhk', '3bhk', '4bhk'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter property price'],
    min: [0, 'Price cannot be negative'],
  },
  location: {
    type: String,
    required: [true, 'Please enter property location'],
    maxLength: [50, 'Location cannot exceed 50 characters'],
  },
  area: {
    type: Number,
    required: [true, 'Please enter property area'],
    min: [1, 'Area must be at least 1 sq ft'],
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
  },
  features: {
    electricity: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    waterSupply: { type: Boolean, default: false },
  },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one image is required',
    },
    required: [true, 'Property images are required'],
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'pending', 'rejected', 'sold', 'inactive'],
    default: 'pending',
  },
  views: {
    total: { type: Number, default: 0 },
    loggedIn: { type: Number, default: 0 },
    anonymous: { type: Number, default: 0 },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  amenities: [String],
  rules: [String],
  availableFrom: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

propertySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ location: 1, type: 1, price: 1 });
propertySchema.index({ sellerId: 1, status: 1 });

export default mongoose.model('Property', propertySchema);

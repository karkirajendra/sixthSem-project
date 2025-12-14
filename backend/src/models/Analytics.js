import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['page_view', 'property_view', 'user_session'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop',
    },
    browser: String,
    os: String,
    location: {
      city: String,
      region: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    page: {
      url: String,
      title: String,
      referrer: String,
    },
    metadata: {
      duration: Number, // Session duration in seconds
      searchQuery: String,
      filters: mongoose.Schema.Types.Mixed,
      conversionValue: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AnalyticsSchema.index({ type: 1, createdAt: 1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ userId: 1, createdAt: 1 });
AnalyticsSchema.index({ propertyId: 1, createdAt: 1 });
AnalyticsSchema.index({ 'location.city': 1 });
AnalyticsSchema.index({ device: 1 });

export default mongoose.model('Analytics', AnalyticsSchema);

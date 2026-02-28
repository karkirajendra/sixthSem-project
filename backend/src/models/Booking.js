import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupSize: {
      type: Number,
      min: [1, 'Group size must be at least 1'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    checkIn: {
      type: Date,
      required: false,
    },
    checkOut: {
      type: Date,
      required: false,
    },
    notes: {
      type: String,
      maxLength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up availability lookups
bookingSchema.index({ property: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);


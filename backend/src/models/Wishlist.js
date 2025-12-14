import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can't add the same property to wishlist multiple times
wishlistSchema.index({ user: 1, property: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);

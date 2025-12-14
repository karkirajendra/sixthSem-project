import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  type: {
    type: String,
    enum: ['property_review', 'platform_feedback', 'bug_report', 'suggestion'],
    required: [true, 'Feedback type is required'],
  },
  subject: {
    type: String,
    required: [true, 'Feedback subject is required'],
    maxLength: [100, 'Subject cannot exceed 100 characters'],
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    maxLength: [1000, 'Message cannot exceed 1000 characters'],
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  attachments: [String], // URLs to attached files
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  showOnFrontend: {
    type: Boolean,
    default: false,
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

feedbackSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
feedbackSchema.index({ user: 1, type: 1 });
feedbackSchema.index({ property: 1, type: 1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);

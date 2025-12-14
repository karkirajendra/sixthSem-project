import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'Inappropriate Content',
        'Fake Listing',
        'Duplicate Listing',
        'Spam',
        'Incorrect Information',
        'Privacy Violation',
        'Scam/Fraud',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    },
    actionTaken: {
      type: String,
      enum: [
        'No Action',
        'Warning Issued',
        'Listing Removed',
        'User Suspended',
        'Content Modified',
        'Other',
      ],
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    evidence: [
      {
        type: String, // URLs to screenshots or other evidence
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ property: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reason: 1 });

// Populate property and user details by default
reportSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'property',
    select: 'title type location price owner',
  })
    .populate({
      path: 'reportedBy',
      select: 'name email',
    })
    .populate({
      path: 'resolvedBy',
      select: 'name email',
    });
  next();
});

const Report = mongoose.model('Report', reportSchema);

export default Report;

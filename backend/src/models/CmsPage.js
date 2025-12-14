import mongoose from 'mongoose';

const cmsPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Page title is required'],
    maxLength: [100, 'Title cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Page slug is required'],
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Page content is required'],
  },
  type: {
    type: String,
    enum: ['about', 'privacy', 'terms', 'blog', 'custom'],
    required: [true, 'Page type is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featuredImage: {
    type: String,
  },
  seoMeta: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Blog post specific fields (when type is 'blog')
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    maxLength: [150, 'Title cannot exceed 150 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  excerpt: {
    type: String,
    maxLength: [300, 'Excerpt cannot exceed 300 characters'],
  },
  featuredImage: {
    type: String,
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
  },
  tags: [String],
  author: {
    name: String,
    email: String,
    avatar: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  readTime: Number, // in minutes
  views: {
    type: Number,
    default: 0,
  },
  seoMeta: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cmsPageSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

blogPostSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  // Calculate read time (average 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(' ').length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  next();
});

// Indexes
cmsPageSchema.index({ slug: 1, status: 1 });
cmsPageSchema.index({ type: 1, status: 1 });
blogPostSchema.index({ slug: 1, status: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1, status: 1 });

export const CmsPage = mongoose.model('CmsPage', cmsPageSchema);
export const BlogPost = mongoose.model('BlogPost', blogPostSchema);

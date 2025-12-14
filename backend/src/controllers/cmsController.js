import asyncHandler from 'express-async-handler';
import { CmsPage, BlogPost } from '../models/CmsPage.js';

// CMS Pages Controllers

// @desc    Get all CMS pages
// @route   GET /api/cms/pages
// @access  Public
export const getCmsPages = asyncHandler(async (req, res) => {
  const { type, status = 'published', page = 1, limit = 10 } = req.query;

  let query = { status };
  if (type) query.type = type;

  const pages = await CmsPage.find(query)
    .populate('author', 'name email')
    .sort('-updatedAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await CmsPage.countDocuments(query);

  res.json({
    success: true,
    count: pages.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: pages,
  });
});

// @desc    Get single CMS page by slug
// @route   GET /api/cms/pages/:slug
// @access  Public
export const getCmsPageBySlug = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOne({
    slug: req.params.slug,
    status: 'published',
  }).populate('author', 'name email');

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  res.json({
    success: true,
    data: page,
  });
});

// @desc    Create CMS page
// @route   POST /api/cms/pages
// @access  Private (Admin)
export const createCmsPage = asyncHandler(async (req, res) => {
  const pageData = {
    ...req.body,
    author: req.user._id,
  };

  const page = await CmsPage.create(pageData);

  res.status(201).json({
    success: true,
    data: page,
  });
});

// @desc    Update CMS page
// @route   PUT /api/cms/pages/:id
// @access  Private (Admin)
export const updateCmsPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  res.json({
    success: true,
    data: page,
  });
});

// @desc    Delete CMS page
// @route   DELETE /api/cms/pages/:id
// @access  Private (Admin)
export const deleteCmsPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  await CmsPage.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Page deleted successfully',
  });
});

// Blog Posts Controllers

// @desc    Get all blog posts
// @route   GET /api/cms/blog
// @access  Public
export const getBlogPosts = asyncHandler(async (req, res) => {
  const {
    category,
    tags,
    status = 'published',
    page = 1,
    limit = 10,
    search,
  } = req.query;

  let query = { status };

  if (category) query.category = category;
  if (tags) query.tags = { $in: tags.split(',') };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];
  }

  const posts = await BlogPost.find(query)
    .select('-content') // Exclude full content for list view
    .sort('-publishedAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await BlogPost.countDocuments(query);

  res.json({
    success: true,
    count: posts.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: posts,
  });
});

// @desc    Get single blog post by slug
// @route   GET /api/cms/blog/:slug
// @access  Public
export const getBlogPostBySlug = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    status: 'published',
  });

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  // Increment views
  post.views += 1;
  await post.save();

  res.json({
    success: true,
    data: post,
  });
});

// @desc    Create blog post
// @route   POST /api/cms/blog
// @access  Private (Admin)
export const createBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Update blog post
// @route   PUT /api/cms/blog/:id
// @access  Private (Admin)
export const updateBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  res.json({
    success: true,
    data: post,
  });
});

// @desc    Delete blog post
// @route   DELETE /api/cms/blog/:id
// @access  Private (Admin)
export const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Blog post not found');
  }

  await BlogPost.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Blog post deleted successfully',
  });
});

// @desc    Get blog categories
// @route   GET /api/cms/blog/categories
// @access  Public
export const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await BlogPost.distinct('category', {
    status: 'published',
  });

  res.json({
    success: true,
    data: categories,
  });
});

// @desc    Get blog tags
// @route   GET /api/cms/blog/tags
// @access  Public
export const getBlogTags = asyncHandler(async (req, res) => {
  const tags = await BlogPost.distinct('tags', { status: 'published' });

  res.json({
    success: true,
    data: tags,
  });
});

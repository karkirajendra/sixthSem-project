import express from 'express';
import {
  getCmsPages,
  getCmsPageBySlug,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  getBlogTags,
} from '../controllers/cmsController.js';
import { protect, roleAuth } from '../middlewares/auth.js';

const router = express.Router();

// CMS Pages routes
router.get('/pages', getCmsPages);
router.get('/pages/:slug', getCmsPageBySlug);
router.post('/pages', protect, roleAuth('admin'), createCmsPage);
router.put('/pages/:id', protect, roleAuth('admin'), updateCmsPage);
router.delete('/pages/:id', protect, roleAuth('admin'), deleteCmsPage);

// Blog routes
router.get('/blog', getBlogPosts);
router.get('/blog/categories', getBlogCategories);
router.get('/blog/tags', getBlogTags);
router.get('/blog/:slug', getBlogPostBySlug);
router.post('/blog', protect, roleAuth('admin'), createBlogPost);
router.put('/blog/:id', protect, roleAuth('admin'), updateBlogPost);
router.delete('/blog/:id', protect, roleAuth('admin'), deleteBlogPost);

export default router;

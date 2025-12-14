import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { protect, roleAuth } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and buyer role
router.use(protect);
router.use(roleAuth('buyer'));

router.get('/', getWishlist);
router.post('/:propertyId', addToWishlist);
router.delete('/:propertyId', removeFromWishlist);
router.get('/check/:propertyId', checkWishlistStatus);
router.delete('/', clearWishlist);

export default router;

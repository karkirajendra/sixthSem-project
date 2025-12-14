import express from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  updateContact,
  deleteContact,
  getContactStats,
} from '../controllers/contactController.js';
import { protect, roleAuth } from '../middlewares/auth.js';
import { validateContact } from '../middlewares/validation.js';

const router = express.Router();

// Public route for contact form submission
router.post('/', validateContact, createContact);

// Admin only routes
router.use(protect);
router.use(roleAuth('admin'));

router.get('/', getAllContacts);
router.get('/stats', getContactStats);
router.get('/:id', getContactById);
router.put('/:id/status', updateContactStatus);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;

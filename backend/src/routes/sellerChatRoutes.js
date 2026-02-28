import express from 'express';
import { protect, roleAuth } from '../middlewares/auth.js';
import {
  getSellerChatRooms,
  getSellerPropertyChats,
  getSellerRoomMessages,
  sendSellerMessage,
  markSellerMessagesAsRead,
} from '../controllers/chatController.js';

const router = express.Router();

// All seller chat routes require authentication and seller/admin role
router.use(protect, roleAuth('seller', 'admin'));

router.get('/rooms', getSellerChatRooms);
router.get('/property-chats', getSellerPropertyChats);
router.get('/messages/:roomId', getSellerRoomMessages);
router.post('/message', sendSellerMessage);
router.put('/messages/read', markSellerMessagesAsRead);

export default router;


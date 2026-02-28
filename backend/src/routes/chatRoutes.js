import express from 'express';
import { protect, roleAuth } from '../middlewares/auth.js';
import {
  getOrCreateChatRoom,
  getUserChatRooms,
  getPropertyChats,
  getRoomMessages,
  sendMessage,
  getUnreadCount,
  markMessagesAsRead,
} from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Buyer/admin chat endpoints
router.post('/room', getOrCreateChatRoom);
router.get('/rooms', getUserChatRooms);
router.get('/rooms/:roomId/messages', getRoomMessages);
router.post('/message', sendMessage);
router.get('/property-chats', getPropertyChats);
router.get('/unread-count', getUnreadCount);
router.post('/messages/read', markMessagesAsRead);

export default router;


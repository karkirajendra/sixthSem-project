// frontend/src/api/chat.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get or create chat room
export const getOrCreateChatRoom = async (propertyId, sellerId, buyerId = null, isAdminChat = false) => {
  const response = await api.post('/room', { 
    propertyId, 
    sellerId, 
    buyerId, 
    isAdminChat 
  });
  return response.data;
};

// Get messages for a chat room
export const getMessages = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/messages`);
  return response.data;
};

// Send a message
export const sendMessage = async (messageData) => {
  const { text, receiverId, roomId, propertyId } = messageData;
  
  if (!text || !receiverId || !roomId) {
    throw new Error('Text, receiverId, and roomId are required');
  }

  const response = await api.post('/message', {
    text,
    receiverId,
    roomId,
    propertyId
  });
  return response.data;
};

// Get user's chat rooms with optional filtering
export const getChatRooms = async (type = null) => {
  const params = type ? { type } : {};
  const response = await api.get('/rooms', { params });
  return response.data;
};

// Get property chats (for sellers)
export const getPropertyChats = async () => {
  const response = await api.get('/property-chats');
  return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
  const response = await api.get('/unread-count');
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (roomId) => {
  const response = await api.post('/messages/read', { roomId });
  return response.data;
};

// ============= USAGE EXAMPLES =============

// Example usage in React components:

/*
// For Buyers - Get or create chat with seller about a property
const startChatWithSeller = async (propertyId, sellerId) => {
  try {
    const chatRoom = await getOrCreateChatRoom(propertyId, sellerId);
    // Navigate to chat or open chat modal
    return chatRoom;
  } catch (error) {
    console.error('Error starting chat:', error);
  }
};

// For Sellers - Get all property-related chats
const loadSellerChats = async () => {
  try {
    const chats = await getPropertyChats();
    return chats;
  } catch (error) {
    console.error('Error loading seller chats:', error);
  }
};

// For Both - Send a message in existing chat room
const handleSendMessage = async (text, receiverId, roomId, propertyId = null) => {
  try {
    const message = await sendMessage({
      text,
      receiverId,
      roomId,
      propertyId
    });
    // Update UI with new message
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// For Both - Get chat rooms with filtering
const loadUserChats = async (userRole) => {
  try {
    let chats;
    
    if (userRole === 'seller') {
      // Sellers might want to see property chats specifically
      chats = await getPropertyChats();
    } else {
      // Buyers get all their chats
      chats = await getChatRooms();
    }
    
    return chats;
  } catch (error) {
    console.error('Error loading chats:', error);
  }
};

// Mark messages as read when user opens a chat
const handleOpenChat = async (roomId) => {
  try {
    await markMessagesAsRead(roomId);
    const messages = await getMessages(roomId);
    return messages;
  } catch (error) {
    console.error('Error opening chat:', error);
  }
};
*/

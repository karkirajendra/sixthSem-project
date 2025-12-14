// frontend/src/api/sellerChatApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/seller/chat';

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

// Get seller's chat rooms
export const getSellerChatRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

// Get seller's property chats
export const getSellerPropertyChats = async () => {
  const response = await api.get('/property-chats');
  return response.data;
};

// Get messages for seller chat room
export const getSellerChatMessages = async (roomId) => {
  const response = await api.get(`/messages/${roomId}`);
  return response.data;
};

// Send seller message
export const sendSellerMessage = async (messageData) => {
  const response = await api.post('/message', messageData);
  return response.data;
};

// Mark seller messages as read
export const markSellerMessagesAsRead = async (roomId) => {
  const response = await api.put('/messages/read', { roomId });
  return response.data;
};

// Get seller's unread message count
export const getSellerUnreadCount = async () => {
  const response = await api.get('/unread-count');
  return response.data;
};
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/chat';

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

// Get admin chat rooms
export const getAdminChatRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

// Get all sellers
export const getSellersForAdmin = async () => {
  const response = await api.get('/sellers');
  return response.data;
};

// Get or create admin-seller chat room
export const getOrCreateAdminSellerChat = async (sellerId) => {
  const response = await api.post('/room', { sellerId });
  return response.data;
};

// Get messages for admin chat room
export const getAdminChatMessages = async (roomId) => {
  const response = await api.get(`/messages/${roomId}`);
  return response.data;
};

// Send message as admin
export const sendAdminMessage = async (messageData) => {
  const response = await api.post('/message', messageData);
  return response.data;
};
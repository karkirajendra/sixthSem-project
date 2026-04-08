const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};

export const notificationApi = {
  // Get all notifications
  getNotifications: async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API Error in getNotifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API Error in markAllAsRead:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark a single notification as read
  markAsRead: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API Error in markAsRead:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all notifications
  clearAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error('API Error in clearAll:', error);
      return { success: false, error: error.message };
    }
  },
};

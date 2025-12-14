import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw {
        success: false,
        message: 'Request timeout. Please check your connection.',
        errors: []
      };
    }
    
    if (!error.response) {
      throw {
        success: false,
        message: 'Network error. Please check your connection.',
        errors: []
      };
    }
    
    return Promise.reject(error);
  }
);

const feedbackApi = {
  submitFeedback: async (feedbackData) => {
    try {
      // Map frontend category to backend type using the EXACT backend enum values
      const payload = {
        rating: feedbackData.rating,
        message: feedbackData.message,
        subject: feedbackData.subject || `Feedback - ${feedbackData.category}`,
        type: feedbackApi.getValidFeedbackType(feedbackData.category), // Use backend enum values
        category: feedbackData.category // Also send category for admin panel
      };

      // Add user info for non-authenticated users
      if (feedbackData.name) {
        payload.name = feedbackData.name;
      }
      if (feedbackData.email) {
        payload.email = feedbackData.email;
      }

      console.log('Sending payload:', payload);

      const response = await api.post('/feedback/submit', payload);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: error.message || 'Failed to submit feedback',
        errors: []
      };
    }
  },

  // Map frontend categories to backend type enum values
  getValidFeedbackType: (category) => {
    // Backend validation expects these EXACT values:
    // ['property_review', 'platform_feedback', 'bug_report', 'suggestion', 'testimonial', 'general']
    
    const categoryMapping = {
      'testimonial': 'testimonial',
      'bug_report': 'bug_report', 
      'feature_request': 'suggestion',
      'general': 'general'
    };
    
    // Return the mapped value or default to 'general'
    return categoryMapping[category] || 'general';
  },

  // Get testimonials for frontend display (public)
  getTestimonials: async () => {
    try {
      const response = await api.get('/feedback/testimonials');
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to load testimonials',
        data: []
      };
    }
  },

  // Get all approved feedback for display (public)
  getApprovedFeedback: async (category = null) => {
    try {
      let url = '/feedback/approved';
      if (category) {
        url += `?category=${category}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to load feedback',
        data: []
      };
    }
  },

  // Get user's own feedback (requires authentication)
  getUserFeedback: async () => {
    try {
      const response = await api.get('/feedback/my-feedback');
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to load your feedback',
        data: []
      };
    }
  },

  // Get single feedback by ID (requires authentication)
  getFeedbackById: async (id) => {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to load feedback'
      };
    }
  },

  // Update user's own feedback (requires authentication)
  updateUserFeedback: async (id, updateData) => {
    try {
      const response = await api.put(`/feedback/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update feedback'
      };
    }
  },

  // Delete user's own feedback (requires authentication)
  deleteUserFeedback: async (id) => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete feedback'
      };
    }
  }
};

export default feedbackApi;
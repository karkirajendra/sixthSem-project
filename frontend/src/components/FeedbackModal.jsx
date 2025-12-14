import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaTimes, FaPaperPlane, FaUser, FaEnvelope, FaComment, FaHeading } from 'react-icons/fa';
import { useAuth } from "../contexts/AuthContext";
import feedbackApi from '../api/feedbackApi';
import { toast } from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { currentUser: user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    message: '',
    subject: '',
    category: 'general',
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const starsRef = useRef(null);

  // Auto-fill user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        email: ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Subject is now optional but if provided, validate it
    if (formData.subject.trim() && formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters if provided';
    }

    if (formData.subject.trim().length > 100) {
      newErrors.subject = 'Subject cannot exceed 100 characters';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter at least 10 characters for your feedback';
    }

    if (formData.message.trim().length > 1000) {
      newErrors.message = 'Feedback cannot exceed 1000 characters';
    }

    if (!user) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        newErrors.name = 'Please enter your name (at least 2 characters)';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        rating: Math.round(formData.rating), // Ensure whole number rating
        message: formData.message.trim(),
        subject: formData.subject.trim(),
        category: formData.category
      };

      // Only add name/email if user is not logged in
      if (!user) {
        submitData.name = formData.name.trim();
        submitData.email = formData.email.trim();
      }

      console.log('Submitting data:', submitData);

      const result = await feedbackApi.submitFeedback(submitData);
      
      if (result.success) {
        toast.success('Thank you for your feedback! We\'ll review it shortly.');
        
        // Reset form but keep user data if logged in
        setFormData({
          rating: 5,
          message: '',
          subject: '',
          category: 'general',
          name: user?.name || '',
          email: user?.email || ''
        });
        
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      console.log('Full error object:', JSON.stringify(error, null, 2));
      
      if (error.errors && error.errors.length > 0) {
        console.log('Backend validation errors:', error.errors);
        
        const backendErrors = {};
        error.errors.forEach(err => {
          console.log('Processing error:', err);
          if (err.path) {
            backendErrors[err.path] = err.msg;
          }
        });
        setErrors(backendErrors);
        
        // Show specific validation errors
        const firstError = error.errors[0];
        console.log('First error:', firstError);
        toast.error(`Validation error: ${firstError.msg || 'Please check your input'}`);
      } else {
        toast.error(error.message || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  // Render stars with whole numbers only
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <div 
          key={i} 
          className="relative cursor-pointer"
          onClick={() => handleStarClick(i)}
        >
          <FaStar 
            className={`w-8 h-8 ${i <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
          />
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Help & Feedback</h2>
            <p className="text-sm text-gray-500 mt-1">Share your experience with us</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes className="text-gray-400 w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating with whole numbers only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate your experience? *
            </label>
            <div 
              ref={starsRef}
              className="flex items-center justify-center space-x-2 mb-2"
            >
              {renderStars()}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Click to select rating (1 - 5)
              </p>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-xs mt-1 text-center">{errors.rating}</p>
            )}
          </div>

          {/* Subject - Now Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaHeading className="inline w-3 h-3 mr-1" />
              Subject (Optional)
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${
                errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Brief summary of your feedback (optional)"
              maxLength={100}
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Category - Now Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50 appearance-none bg-white"
            >
              <option value="general">General Feedback</option>
              <option value="testimonial">Testimonial</option>
              <option value="bug_report">Bug Report</option>
              <option value="feature_request">Feature Request</option>
            </select>
          </div>

          {/* Name and Email for non-authenticated users */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline w-3 h-3 mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${
                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline w-3 h-3 mr-1" />
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaComment className="inline w-3 h-3 mr-1" />
              Your Feedback *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50 resize-none ${
                errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Tell us about your experience or share your thoughts..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                Minimum 10 characters required
              </div>
              <div className={`text-xs ${formData.message.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.message.length}/1000
              </div>
            </div>
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim() || formData.message.trim().length < 10}
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-blue-500 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Your feedback matters!</h4>
                <p className="text-xs text-blue-700">
                  We review all feedback carefully. Positive reviews may be featured on our website to help other users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
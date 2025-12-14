import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaMapMarkerAlt } from 'react-icons/fa';
import feedbackApi from '../../api/feedbackApi';
import { toast } from 'react-hot-toast';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getTestimonials();
      
      if (response.success && response.data) {
        setTestimonials(response.data);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
      // Don't show error toast for testimonials as it's not critical
      // toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handleScrollToFeedback = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
      // Give a small delay then trigger feedback modal
      setTimeout(() => {
        const feedbackButton = footer.querySelector('button[aria-label="Open feedback modal"]') || 
                              footer.querySelector('button:has([data-feedback])') ||
                              footer.querySelector('button:contains("Help & Feedback")');
        if (feedbackButton) {
          feedbackButton.click();
        }
      }, 800);
    }
  };

  // Don't render if no testimonials and not loading
  if (!loading && testimonials.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 py-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-full translate-x-32 translate-y-32"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-1 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                Customer Stories
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Don't just take our word for it. Here's what people who have used our platform have to say.
            </p>
          </div>
          
          {/* Empty State with Call-to-Action */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaQuoteLeft className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Be the First to Share Your Experience!
              </h3>
              <p className="text-gray-600 mb-6">
                We'd love to hear about your experience with our platform. Your feedback helps us improve and helps others make informed decisions.
              </p>
              <button
                onClick={handleScrollToFeedback}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
              >
                Share Your Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 py-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-full translate-x-32 translate-y-32"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-1 mb-4">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              Customer Stories
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Don't just take our word for it. Here's what people who have used our platform have to say.
          </p>
        </div>
        
        {loading ? (
          // Loading State
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 mx-4">
              <div className="animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex justify-center mb-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-14 h-14 bg-gray-300 rounded-full mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Testimonial Slider
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id || testimonial.id} className="min-w-full px-4">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 mx-auto">
                      {/* Quote Icon */}
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                          <FaQuoteLeft className="text-white text-xl" />
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400 text-lg mx-1" />
                        ))}
                      </div>
                      
                      {/* Testimonial Text */}
                      <p className="text-gray-700 text-center leading-relaxed mb-6 text-lg">
                        "{testimonial.message || testimonial.text}"
                      </p>
                      
                      {/* User Info */}
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <img 
                            src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3B82F6&color=fff`} 
                            alt={testimonial.name} 
                            className="w-14 h-14 rounded-full border-4 border-white shadow-md"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3B82F6&color=fff`;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="ml-4 text-center">
                          <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                          <p className="text-blue-600 font-medium text-sm">{testimonial.role || 'User'}</p>
                          <div className="flex items-center justify-center mt-1">
                            <FaMapMarkerAlt className="text-gray-400 text-xs mr-1" />
                            <span className="text-gray-500 text-xs">{testimonial.location || 'Unknown Location'}</span>
                          </div>
                          {testimonial.featured && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800">
                                ⭐ Featured
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows - Only show if more than 1 testimonial */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300 flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300 flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Navigation Dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`transition-all duration-300 ${
                        currentIndex === index 
                          ? 'w-6 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full' 
                          : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Add Feedback CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={handleScrollToFeedback}
            className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 rounded-lg hover:bg-white hover:shadow-lg transition-all duration-200 font-medium"
          >
            <FaQuoteLeft className="mr-2 text-blue-500" />
            Share Your Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
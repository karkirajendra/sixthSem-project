import { useState, useEffect } from 'react';
import { FaHeart, FaEnvelope, FaHome, FaUser, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import RecommendationSection from '../../components/recommendation/RecommendationSection';
const BuyerDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    wishlistCount: 0,
    inquiriesCount: 0,
    savedSearches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadStats = async () => {
      try {
        // In a real app, we would fetch these from the API
        setTimeout(() => {
          setStats({
            wishlistCount: 5,
            inquiriesCount: 3,
            savedSearches: 4,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading buyer stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          🏠 Welcome to RoomSathi, <span className="text-indigo-600 ml-2">{currentUser?.name || 'User'}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Track your property search journey and find your perfect place</p>
      </div>
      
      {/* Quick Stats Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm animate-pulse h-32">
              <div className="flex justify-between h-full">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="My Wishlist" 
            value={stats.wishlistCount.toString()} 
            icon={<FaHeart className="text-2xl text-pink-500" />} 
            color="pink"
            link="/buyer/wishlist"
          />
          
          <StatCard 
            title="Inquiries Sent" 
            value={stats.inquiriesCount.toString()} 
            icon={<FaEnvelope className="text-2xl text-blue-500" />} 
            color="blue"
            link="/buyer/inquiries"
          />
          
          <StatCard 
            title="Saved Searches" 
            value={stats.savedSearches.toString()} 
            icon={<FaBookmark className="text-2xl text-indigo-500" />} 
            color="indigo"
            link="/properties"
          />
        </div>
      )}
      
      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/properties" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaHome className="text-indigo-600 text-xl" />
            </div>
            <span className="font-medium text-gray-800">Browse Properties</span>
          </a>
          
          <a 
            href="/buyer/wishlist" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-200 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaHeart className="text-pink-600 text-xl" />
            </div>
            <span className="font-medium text-gray-800">View Wishlist</span>
          </a>
          
          <a 
            href="/buyer/messages" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaEnvelope className="text-blue-600 text-xl" />
            </div>
            <span className="font-medium text-gray-800">Messages</span>
          </a>
          
          <a 
            href="/buyer/profile" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUser className="text-green-600 text-xl" />
            </div>
            <span className="font-medium text-gray-800">My Profile</span>
          </a>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          <div className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="p-3 rounded-full mr-4 bg-indigo-100 text-indigo-600">
              <FaHome />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                You contacted the owner of "Cozy Apartment in Kathmandu"
              </p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Replied
            </div>
          </div>
          
          <div className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="p-3 rounded-full mr-4 bg-pink-100 text-pink-600">
              <FaHeart />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                You saved "Modern Flat in Pokhara" to wishlist
              </p>
              <p className="text-xs text-gray-500 mt-1">1 week ago</p>
            </div>
          </div>
          
          <div className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="p-3 rounded-full mr-4 bg-blue-100 text-blue-600">
              <FaEnvelope />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                You inquired about "Luxury Apartment in Lalitpur"
              </p>
              <p className="text-xs text-gray-500 mt-1">2 weeks ago</p>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Pending
            </div>
          </div>
        </div>
      </div>
      {/* Recommendation Section */}
      <RecommendationSection />
    </div>
  );
};

export default BuyerDashboard;
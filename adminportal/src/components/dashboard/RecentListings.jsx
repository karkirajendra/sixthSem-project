import { FiEye, FiHeart, FiStar } from 'react-icons/fi';

const RecentListings = ({ 
  listings = [], 
  isDark = false,
  maxItems = 4 
}) => {
  if (!listings || listings.length === 0) {
    return (
      <div className={`rounded-xl shadow-sm p-6 h-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Listings
        </h3>
        <div className={`flex items-center justify-center h-48 border border-dashed rounded-lg ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            No recent listings available
          </p>
        </div>
      </div>
    );
  }

  const displayedListings = listings.slice(0, maxItems);

  return (
    <div className={`rounded-xl shadow-sm p-6 h-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Listings in Kathmandu
        </h3>
        <a
          href="/listings"
          className={`text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          View all
        </a>
      </div>
      
      <div className="space-y-4">
        {displayedListings.map((listing) => (
          <div
            key={listing.id}
            className={`flex items-start p-3 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-14 h-14 rounded-md object-cover"
              />
              {listing.featured && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full">
                  <FiStar className="h-3 w-3" />
                </div>
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {listing.title}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 ${
                    listing.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {listing.status}
                </span>
              </div>
              
              <div className="flex items-center mt-1">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {listing.type}
                </span>
                <span className={`mx-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {listing.location}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  रु {listing.price.toLocaleString()}/mo
                </p>
                <div className="flex space-x-2">
                  <span className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiEye className="mr-1" /> {listing.views || 0}
                  </span>
                  <span className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiHeart className="mr-1" /> {listing.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentListings;
import { useState } from 'react';
import { FaSearch, FaTimes, FaRobot } from 'react-icons/fa';
import { performSuperSearch } from '../../api/recommendationApi';

const SuperSearchBar = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      onSearchResults(null, '');
      return;
    }

    setIsSearching(true);
    try {
      const results = await performSuperSearch(searchQuery);
      
      // Pass the properties array to match your existing PropertiesPage expectations
      onSearchResults(results.properties || [], searchQuery);
      
    } catch (error) {
      console.error('Search failed:', error);
      onSearchResults([], searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearchResults(null, '');
  };

  // Example queries for better UX
  const exampleQueries = [
    "rooms under 15k",
    "flat in Kathmandu over 20k", 
    "apartment in Lalitpur between 10k to 25k",
    "budget rooms in Bhaktapur"
  ];

  const setExampleQuery = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden border-2 border-transparent focus-within:border-blue-300 transition-all duration-300">
          {/* AI Icon */}
          {/* <div className="px-4 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
            <FaRobot className="text-lg" />
          </div> */}
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Try: 'rooms under 15k' or 'flat in Kathmandu over 20k'"
            className="flex-grow px-6 py-4 focus:outline-none text-gray-800 placeholder-gray-500"
          />
          
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className={`bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-4 flex items-center justify-center transition-all ${
              isSearching ? 'opacity-75' : 'hover:from-blue-600 hover:to-teal-600'
            } ${!searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Search with AI"
          >
            {isSearching ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Searching...</span>
              </div>
            ) : (
              <>
                <FaSearch className="mr-2" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>

        {/* Example Queries */}
        {/* <div className="mt-4 text-center">
          <p className="text-white/80 text-sm mb-2">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setExampleQuery(query)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default SuperSearchBar;
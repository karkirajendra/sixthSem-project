import { useState } from 'react';
import {
  Search,
  MapPin,
  Home,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';

const SearchFilters = ({ onSearch, layout = 'vertical' }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search,
      location,
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const locationOptions = [
    'Lalitpur',
    'Bhaktapur',
    'Kathmandu',
    'Nepalgunj',
    'Birgunj',
    'kalanki',
    'Boudha',
    'Kirtipur',
    'chabahil',
    'swayambhu',
    'gausala',
    'Hetauda',
    'Dharan',
    'Itahari',
    'Janakpur',
    'Bhairahawa',
    'Butwal',
    'Biratnagar',
    'Pokhara',
  ];

  const propertyTypes = [
    { value: 'room', label: 'Room' },
    { value: 'flat', label: 'Flat' },
    { value: 'apartment', label: 'Apartment' },
  ];

  // Horizontal layout for Home page
  if (layout === 'horizontal') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="search-h"
                className="block text-sm font-semibold text-gray-700"
              >
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="search-h"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="location-h"
                className="block text-sm font-semibold text-gray-700"
              >
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  list="locations-h"
                  id="location-h"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where do you want to live?"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                />
                <datalist id="locations-h">
                  {locationOptions.map((loc) => (
                    <option
                      key={loc}
                      value={loc}
                    />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label
                htmlFor="type-h"
                className="block text-sm font-semibold text-gray-700"
              >
                Property Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="type-h"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer text-sm"
                >
                  <option value="">All Property Types</option>
                  {propertyTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Search</span>
            </button>
          </div>

          {/* More Filters Button - Mobile shows above search button */}
          <div className="mt-3 text-center order-1 md:order-2">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center justify-center space-x-1 mx-auto"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>+ More Filters</span>
            </button>
          </div>

          {/* Advanced Filters for Horizontal Layout */}
          {isAdvancedOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
              {/* Price Range Section */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xs">NRP</span>
                    </div>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min Price"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xs">NRP</span>
                    </div>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max Price"
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Price Range Helper */}
                <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-3">
                  <div className="text-xs font-medium text-blue-700 mb-1">
                    Popular Price Ranges
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Under NPR 10K', min: 0, max: 10000 },
                      { label: 'NPR 5K - 15K', min: 5000, max: 15000 },
                      { label: 'NPR 15K+', min: 15000, max: '' },
                    ].map((range) => (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          setMinPrice(range.min.toString());
                          setMaxPrice(range.max.toString());
                        }}
                        className="text-xs px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-md transition-colors duration-200"
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setLocation('');
                    setType('');
                    setMinPrice('');
                    setMaxPrice('');
                    onSearch({
                      search: '',
                      location: '',
                      type: '',
                      minPrice: undefined,
                      maxPrice: undefined,
                    });
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-md transition-colors duration-200 text-xs"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(
                      'Save search functionality would be implemented here'
                    );
                  }}
                  className="bg-green-100 hover:bg-green-200 text-green-700 font-medium py-1.5 px-3 rounded-md transition-colors duration-200 text-xs"
                >
                  Save Search
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Vertical layout for Properties page (existing layout)
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="space-y-6">
        {/* Primary Search Fields */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-gray-700"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties, locations..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700"
            >
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                list="locations"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or area"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
              <datalist id="locations">
                {locationOptions.map((loc) => (
                  <option
                    key={loc}
                    value={loc}
                  />
                ))}
              </datalist>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-sm font-semibold text-gray-700"
            >
              Property Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Home className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
              >
                <option value="">All Property Types</option>
                {propertyTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 border border-gray-200"
          >
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Price Range
              </span>
            </div>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Min Price */}
              <div className="space-y-2">
                <label
                  htmlFor="minPrice"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Min Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">NPR</span>
                  </div>
                  <input
                    type="number"
                    id="minPrice"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <label
                  htmlFor="maxPrice"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Max Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">NPR</span>
                  </div>
                  <input
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    min="0"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Price Range Helper */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="text-xs font-medium text-blue-700 mb-1">
                Popular Price Ranges
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Under NPR 10K', min: 0, max: 10000 },
                  { label: 'NPR 5K - 15K', min: 5000, max: 15000 },
                  { label: 'NPR 15K+', min: 15000, max: '' },
                ].map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(range.min.toString());
                      setMaxPrice(range.max.toString());
                    }}
                    className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Search className="h-5 w-5" />
          <span>Search Properties</span>
        </button>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setLocation('');
              setType('');
              setMinPrice('');
              setMaxPrice('');
              onSearch({
                search: '',
                location: '',
                type: '',
                minPrice: undefined,
                maxPrice: undefined,
              });
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => {
              // You can add save search functionality here
              alert('Save search functionality would be implemented here');
            }}
            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Save Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilters;

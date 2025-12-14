import { useState, useEffect, useCallback } from 'react';
import ListingTable from '../components/listings/ListingTable';
import { getListings } from '../utils/adminApi';
import {
  FiHome,
  FiPlusCircle,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Listings = ({ isDark }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const listingsData = await getListings(filters);
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings data:', error);
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleRefresh = () => {
    fetchListings();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Loading listings...
          </p>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(
    (listing) => listing.status === 'Active'
  ).length;
  const pendingListings = listings.filter(
    (listing) => listing.status === 'Pending'
  ).length;
  const averagePrice = Math.floor(
    listings.reduce((sum, item) => sum + item.price, 0) / (listings.length || 1)
  );

  const stats = [
    {
      title: 'Total Listings',
      value: listings.length,
      icon: FiHome,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      borderColor: isDark ? 'border-blue-800' : 'border-blue-100',
      textColor: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    {
      title: 'Active Listings',
      value: activeListings,
      icon: FiTrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
      borderColor: isDark ? 'border-green-800' : 'border-green-100',
      textColor: isDark ? 'text-green-400' : 'text-green-600',
    },
    {
      title: 'Pending Approval',
      value: pendingListings,
      icon: FiClock,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: isDark ? 'bg-amber-900/20' : 'bg-amber-50',
      borderColor: isDark ? 'border-amber-800' : 'border-amber-100',
      textColor: isDark ? 'text-amber-400' : 'text-amber-600',
    },
    {
      title: 'Average Price',
      value: `Rs. ${averagePrice.toLocaleString()}`,
      icon: FiDollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      borderColor: isDark ? 'border-purple-800' : 'border-purple-100',
      textColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Listings Management
          </h1>
          <p
            className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-2`}
          >
            Monitor and manage all property listings with comprehensive insights
          </p>
        </div>

        {/* Decorative Element */}
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Status</option>
              <option value="available">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Studio">Studio</option>
              <option value="Room">Room</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <FiRefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Add Listing Button */}
          <Link to="/add-listings">
            <button className="btn-primary flex items-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
              <FiPlusCircle className="mr-2 h-4 w-4" />
              Add New Listing
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor} mb-2`}>
                    {stat.title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Listings Table */}
      <div
        className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-xl border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } overflow-hidden`}
      >
        <div
          className={`px-6 py-4 border-b ${
            isDark
              ? 'border-gray-700 bg-gray-900/50'
              : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            All Listings
          </h2>
          <p
            className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-1`}
          >
            Manage property listings, status, and details
          </p>
        </div>

        <div className="p-6">
          <ListingTable
            listings={listings}
            isDark={isDark}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default Listings;

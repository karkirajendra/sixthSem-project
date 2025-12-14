import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../../api/api';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes,
  FaHome,
  FaClock,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { IoMdRefresh, IoMdTrendingUp } from 'react-icons/io';
import toast from 'react-hot-toast';

const SellerListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyProperties(filters);
      console.log('Fetched properties:', response);

      setProperties(response.data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    let aValue, bValue;

    // Handle nested properties
    if (sortBy.includes('.')) {
      const keys = sortBy.split('.');
      aValue = keys.reduce((obj, key) => obj?.[key], a);
      bValue = keys.reduce((obj, key) => obj?.[key], b);
    } else {
      aValue = a[sortBy];
      bValue = b[sortBy];
    }

    // Handle null/undefined values
    if (aValue == null) aValue = 0;
    if (bValue == null) bValue = 0;

    // For string values, use localeCompare
    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // For numeric values and dates, use simple comparison
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProperties();
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate stats
  const activeProperties = properties.filter(
    (p) => p.status === 'available'
  ).length;
  const pendingProperties = properties.filter(
    (p) => p.status === 'pending'
  ).length;
  const totalViews = properties.reduce(
    (sum, prop) => sum + (prop.views?.total || 0),
    0
  );

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length,
      icon: FaHome,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Active Listings',
      value: activeProperties,
      icon: IoMdTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      title: 'Pending Review',
      value: pendingProperties,
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: FaEye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
  ];

  // Handle delete property
  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const response = await deleteProperty(propertyToDelete);
      if (response.success) {
        // Update the local state
        setProperties(
          properties.filter((property) => property.id !== propertyToDelete)
        );
        setDeleteModalOpen(false);
        setPropertyToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Open delete modal
  const openDeleteModal = (id) => {
    setPropertyToDelete(id);
    setDeleteModalOpen(true);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-lg text-gray-600 mt-2">
            Monitor and manage your property listings with comprehensive
            insights
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
              className="px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <IoMdRefresh
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Add Property Button */}
          <Link
            to="/seller/add-property"
            className="btn-primary flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
          >
            <FaPlus className="mr-2" />
            <span>Add New Property</span>
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
                  <p className={`text-sm font-medium ${stat.color} mb-2`}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Property Listings Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600">
                Loading your properties...
              </p>
            </div>
          </div>
        ) : properties.length > 0 ? (
          <div className="p-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">
                All Properties
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your property listings, status, and details
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('_id')}
                    >
                      <div className="flex items-center">
                        <span>ID</span>
                        {sortBy === '_id' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        <span>Title</span>
                        {sortBy === 'title' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        <span>Type</span>
                        {sortBy === 'type' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        <span>Price</span>
                        {sortBy === 'price' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortBy === 'status' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('views.total')}
                    >
                      <div className="flex items-center">
                        <span>Views</span>
                        {sortBy === 'views.total' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <span>Created</span>
                        {sortBy === 'createdAt' && (
                          <div className="ml-1">
                            {sortOrder === 'asc' ? (
                              <FaArrowUp className="text-blue-500" />
                            ) : (
                              <FaArrowDown className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProperties.map((property) => (
                    <tr
                      key={property._id || property.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property._id?.slice(-6) || property.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={
                                property.images?.[0] ||
                                property.imageUrl ||
                                '/api/placeholder/40/40'
                              }
                              alt={property.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(property.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : property.status === 'sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          } capitalize`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaEye className="mr-1 text-gray-500" />
                            <span>{property.views?.total || 0} total</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.createdAt
                          ? new Date(property.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/seller/property/${
                              property._id || property.id
                            }`}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/seller/edit-property/${
                              property._id || property.id
                            }`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() =>
                              openDeleteModal(property._id || property.id)
                            }
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              You haven&apos;t added any property listings yet.
            </p>
            <Link
              to="/seller/add-property"
              className="btn-primary"
            >
              Add Your First Property
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Delete Property
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPropertyToDelete(null);
                }}
                className="btn-outline flex items-center"
              >
                <FaTimes className="mr-2" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center"
              >
                <FaCheck className="mr-2" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerListings;

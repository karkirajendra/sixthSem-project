import { useState, useEffect } from 'react';
import {
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiCheck,
  FiX,
  FiStar,
} from 'react-icons/fi';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  updatePropertyStatus,
  deletePropertyAdmin,
  togglePropertyFeatured,
  bulkUpdatePropertiesStatus,
} from '../../utils/adminApi';

const ListingTable = ({ listings: initialListings, isDark, onRefresh }) => {
  const [listings, setListings] = useState(initialListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedListings, setSelectedListings] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    price: '',
    location: '',
    status: 'Active',
    owner: '',
  });

  // Update listings when prop changes
  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditListing = (e) => {
    e.preventDefault();
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === selectedListing.id
          ? { ...listing, ...formData }
          : listing
      )
    );
    setShowEditModal(false);
    toast.success('Listing updated successfully');
  };

  const handleDeleteListing = async () => {
    setLoading(true);
    try {
      const result = await deletePropertyAdmin(selectedListing.id);
      if (result.success) {
        setListings((prev) =>
          prev.filter((listing) => listing.id !== selectedListing.id)
        );
        toast.success('Listing deleted successfully');
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || 'Failed to delete listing');
      }
    } catch (error) {
      toast.error('Failed to delete listing');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    setLoading(true);
    try {
      const result = await updatePropertyStatus(listingId, newStatus);
      if (result.success) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  status: newStatus === 'available' ? 'Active' : 'Pending',
                }
              : listing
          )
        );
        toast.success(`Listing status updated to ${newStatus}`);
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (listingId) => {
    setLoading(true);
    try {
      const result = await togglePropertyFeatured(listingId);
      if (result.success) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === listingId
              ? { ...listing, featured: result.data.featured }
              : listing
          )
        );
        toast.success(
          result.data.featured ? 'Added to featured' : 'Removed from featured'
        );
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || 'Failed to toggle featured status');
      }
    } catch (error) {
      toast.error('Failed to toggle featured status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedListings.length === 0) {
      toast.error('Please select listings and an action');
      return;
    }

    setLoading(true);
    try {
      const result = await bulkUpdatePropertiesStatus(
        selectedListings,
        bulkAction
      );
      if (result.success) {
        setListings((prev) =>
          prev.map((listing) =>
            selectedListings.includes(listing.id)
              ? {
                  ...listing,
                  status: bulkAction === 'available' ? 'Active' : 'Pending',
                }
              : listing
          )
        );
        toast.success(
          `${result.data.modifiedCount} listings updated successfully`
        );
        setSelectedListings([]);
        setBulkAction('');
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || 'Failed to update listings');
      }
    } catch (error) {
      toast.error('Failed to update listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectListing = (listingId) => {
    setSelectedListings((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleSelectAllListings = () => {
    if (selectedListings.length === currentListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(currentListings.map((listing) => listing.id));
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const ListingForm = ({ onSubmit }) => (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
          >
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Studio">Studio</option>
            <option value="Room">Room</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Owner
          </label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            required
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setShowEditModal(false)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Update Listing
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search listings by title or location..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className={`px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Studio">Studio</option>
            <option value="Room">Room</option>
          </select>

          <select
            className={`px-4 py-3 rounded-lg border transition-colors ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg mb-4 ${
            isDark
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {selectedListings.length} listing(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className={`px-3 py-1 rounded border text-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select Action</option>
              <option value="available">Approve</option>
              <option value="pending">Mark as Pending</option>
              <option value="rejected">Reject</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || loading}
              className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`rounded-xl overflow-hidden shadow-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedListings.length === currentListings.length &&
                      currentListings.length > 0
                    }
                    onChange={handleSelectAllListings}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Property
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Price
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Owner
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Created
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-gray-700' : 'divide-gray-200'
              }`}
            >
              {currentListings.length > 0 ? (
                currentListings.map((listing, index) => (
                  <tr
                    key={listing.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => handleSelectListing(listing.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p
                            className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {listing.title}
                          </p>
                          <p
                            className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {listing.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          listing.type === 'House'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : listing.type === 'Apartment'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : listing.type === 'Studio'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}
                      >
                        {listing.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Rs. {listing.price}/mo
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {listing.owner}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {listing.created}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {listing.status === 'Pending' && (
                          <>
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-green-400'
                                  : 'hover:bg-green-50 text-gray-500 hover:text-green-600'
                              }`}
                              title="Approve listing"
                              onClick={() =>
                                handleStatusChange(listing.id, 'available')
                              }
                              disabled={loading}
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                              }`}
                              title="Reject listing"
                              onClick={() =>
                                handleStatusChange(listing.id, 'rejected')
                              }
                              disabled={loading}
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            listing.featured
                              ? isDark
                                ? 'text-yellow-400 hover:bg-gray-700'
                                : 'text-yellow-600 hover:bg-yellow-50'
                              : isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-400'
                              : 'hover:bg-yellow-50 text-gray-500 hover:text-yellow-600'
                          }`}
                          title={
                            listing.featured
                              ? 'Remove from featured'
                              : 'Add to featured'
                          }
                          onClick={() => handleToggleFeatured(listing.id)}
                          disabled={loading}
                        >
                          <FiStar
                            className={`h-4 w-4 ${
                              listing.featured ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                              : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                          }`}
                          title="Edit listing"
                          onClick={() => {
                            setSelectedListing(listing);
                            setFormData(listing);
                            setShowEditModal(true);
                          }}
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                          }`}
                          title="Delete listing"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowDeleteDialog(true);
                          }}
                          disabled={loading}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className={`px-6 py-12 text-center ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        } flex items-center justify-center mb-4`}
                      >
                        <FiSearch className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">
                        No listings found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredListings.length > 0 && (
          <div
            className={`px-6 py-4 border-t ${
              isDark
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredListings.length)} of{' '}
                  {filteredListings.length} results
                </span>

                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(parseInt(e.target.value))
                  }
                  className={`px-3 py-1 rounded border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? isDark
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                          : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? isDark
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Listing"
        isDark={isDark}
      >
        <ListingForm onSubmit={handleEditListing} />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        isDark={isDark}
      />
    </div>
  );
};

export default ListingTable;

import { useState, useEffect } from 'react';
import {
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiPlus,
} from 'react-icons/fi';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

// UserForm component moved outside to prevent recreation on each render
const UserForm = ({
  onSubmit,
  isEdit = false,
  title,
  formData,
  handleInputChange,
  isDark,
  loading,
  onCancel,
}) => (
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
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
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
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isEdit}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 ${
            isEdit ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          required
        />
      </div>
    </div>

    {!isEdit && (
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Password *
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20`}
          required
          minLength={6}
        />
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20`}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>
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
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="blocked">Blocked</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
      <button
        type="button"
        onClick={onCancel}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          isDark
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
      </button>
    </div>
  </form>
);

const UserTable = ({ isDark }) => {
  const {
    users,
    updateUser,
    updateUserStatus,
    deleteUser,
    addUser,
    getUserDetails,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    phone: '',
    status: 'active',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'buyer',
      phone: '',
      status: 'active',
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addUser(formData);
      if (result.success) {
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { ...formData };
      delete updateData.password; // Don't send password in updates

      const result = await updateUser(selectedUser.id, updateData);
      if (result.success) {
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);

    try {
      const result = await deleteUser(selectedUser.id);
      if (result.success) {
        setShowDeleteDialog(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const openEditModal = async (user) => {
    setLoading(true);
    try {
      const userDetails = await getUserDetails(user.id);
      if (userDetails.success) {
        setSelectedUser(userDetails.user);
        setFormData({
          name: userDetails.user.name,
          email: userDetails.user.email,
          role: userDetails.user.role,
          phone: userDetails.user.phone || '',
          status: userDetails.user.status,
        });
      } else {
        // Fallback to basic user data
        setSelectedUser(user);
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          status: user.status,
        });
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add User Button */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2
            className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            User Management
          </h2>
          <p
            className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mt-1`}
          >
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FiPlus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

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
                  User
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Role
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
                  Visits
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  Join Date
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {user.name}
                          </p>
                          <p
                            className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'seller'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            handleStatusChange(user.id, e.target.value)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500/20 ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : user.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : user.status === 'suspended'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {user.visits}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400'
                              : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                          }`}
                          title="Edit user"
                          onClick={() => openEditModal(user)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                              : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                          }`}
                          title="Delete user"
                          onClick={() => {
                            setSelectedUser(user);
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
                    colSpan="6"
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
                      <p className="text-lg font-medium mb-2">No users found</p>
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
        {filteredUsers.length > 0 && (
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
                  {Math.min(endIndex, filteredUsers.length)} of{' '}
                  {filteredUsers.length} results
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New User"
        isDark={isDark}
      >
        <UserForm
          onSubmit={handleAddUser}
          isEdit={false}
          title="Add New User"
          formData={formData}
          handleInputChange={handleInputChange}
          isDark={isDark}
          loading={loading}
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit User"
        isDark={isDark}
      >
        <UserForm
          onSubmit={handleEditUser}
          isEdit={true}
          title="Edit User"
          formData={formData}
          handleInputChange={handleInputChange}
          isDark={isDark}
          loading={loading}
          onCancel={() => {
            setShowEditModal(false);
            resetForm();
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default UserTable;

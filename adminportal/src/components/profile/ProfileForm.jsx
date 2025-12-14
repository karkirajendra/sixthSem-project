import { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiShield,
  FiSave,
  FiLoader,
} from 'react-icons/fi';

const ProfileForm = ({ profile, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeTab === 'profile') {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };

        if (onUpdate) {
          const result = await onUpdate(updateData);
          if (result.success) {
            setMessage({
              type: 'success',
              text: 'Profile updated successfully!',
            });
          } else {
            setMessage({
              type: 'error',
              text: result.message || 'Failed to update profile',
            });
          }
        }
      } else {
        // Handle password change
        if (
          !formData.currentPassword ||
          !formData.newPassword ||
          !formData.confirmPassword
        ) {
          setMessage({
            type: 'error',
            text: 'All password fields are required',
          });
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' });
          return;
        }

        if (formData.newPassword.length < 6) {
          setMessage({
            type: 'error',
            text: 'Password must be at least 6 characters long',
          });
          return;
        }

        const updateData = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        };

        if (onUpdate) {
          const result = await onUpdate(updateData);
          if (result.success) {
            setMessage({
              type: 'success',
              text: 'Password updated successfully!',
            });
            setFormData((prev) => ({
              ...prev,
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }));
          } else {
            setMessage({
              type: 'error',
              text: result.message || 'Failed to update password',
            });
          }
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-8 py-4 px-1 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`py-4 px-1 text-sm font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === 'profile' ? (
          <div>
            <div className="mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold mr-4">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h2 className="text-lg font-medium">
                    {profile.name || 'Admin User'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {profile.role || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last login:{' '}
                    {profile.lastLogin
                      ? new Date(profile.lastLogin).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label
                  htmlFor="name"
                  className="form-label"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Your full name"
                    required
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="email"
                  className="form-label"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Your email address"
                    required
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="phone"
                  className="form-label"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Your phone number"
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShield className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.status || 'Active'}
                    className="form-input pl-10"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Ensure your account is using a strong password to maintain
                security.
              </p>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label
                  htmlFor="currentPassword"
                  className="form-label"
                >
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter current password"
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="newPassword"
                  className="form-label"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter new password"
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="confirmPassword"
                  className="form-label"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Confirm new password"
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiLock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;

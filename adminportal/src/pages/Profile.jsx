import { useState, useEffect } from 'react';
import ProfileForm from '../components/profile/ProfileForm';
import { useAppContext } from '../context/AppContext';
import {
  getAdminProfile,
  updateAdminSettings,
  getAdminActivityLog,
  changeAdminPassword,
} from '../utils/adminApi';
import {
  FiSettings,
  FiShield,
  FiActivity,
  FiBell,
  FiMail,
  FiLock,
} from 'react-icons/fi';

const Profile = () => {
  const { adminProfile, updateAdminProfile, refreshAdminProfile } =
    useAppContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    emailNotifications: true,
    securityAlerts: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Use adminProfile from context if available, otherwise fetch
        if (adminProfile) {
          setProfileData(adminProfile);
        } else {
          const data = await getAdminProfile();
          setProfileData(data);
        }

        // Fetch admin activity log
        const activity = await getAdminActivityLog();
        setActivityLog(activity);

        // Set settings from profile data if available
        const currentProfile = adminProfile || profileData;
        if (currentProfile && currentProfile.settings) {
          setSettings((prev) => ({ ...prev, ...currentProfile.settings }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [adminProfile]);

  const handleSettingChange = async (settingKey, value) => {
    setSettingsLoading(true);
    try {
      const newSettings = { ...settings, [settingKey]: value };
      setSettings(newSettings);

      const result = await updateAdminSettings(newSettings);
      if (result.success) {
        console.log('Settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert the setting on error
      setSettings((prev) => ({ ...prev, [settingKey]: !value }));
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      if (updatedData.currentPassword && updatedData.newPassword) {
        // Handle password change
        const result = await changeAdminPassword({
          currentPassword: updatedData.currentPassword,
          newPassword: updatedData.newPassword,
        });
        return result;
      } else {
        // Handle profile update using context
        const result = await updateAdminProfile(updatedData);
        if (result.success) {
          setProfileData(result.data);
          return { success: true };
        }
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message };
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <svg
          className="animate-spin h-10 w-10 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your admin account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileForm
            profile={profileData}
            onUpdate={handleProfileUpdate}
            loading={settingsLoading}
          />
        </div>

        <div className="space-y-6">
          {/* Account Security */}
          <div className="dashboard-card">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiShield className="h-5 w-5 text-blue-600 mr-2" />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiLock className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Two-factor Authentication</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle-2fa"
                    checked={settings.twoFactorAuth}
                    onChange={(e) =>
                      handleSettingChange('twoFactorAuth', e.target.checked)
                    }
                    disabled={settingsLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-2fa"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiBell className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Login Notifications</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle-notifications"
                    checked={settings.loginNotifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'loginNotifications',
                        e.target.checked
                      )
                    }
                    disabled={settingsLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-notifications"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Email Notifications</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle-email"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'emailNotifications',
                        e.target.checked
                      )
                    }
                    disabled={settingsLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-email"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiShield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Security Alerts</span>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle-security"
                    checked={settings.securityAlerts}
                    onChange={(e) =>
                      handleSettingChange('securityAlerts', e.target.checked)
                    }
                    disabled={settingsLoading}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-security"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiActivity className="h-5 w-5 text-blue-600 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activityLog.length > 0 ? (
                activityLog.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No recent activity</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {profileData?.stats && (
            <div className="dashboard-card">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <FiSettings className="h-5 w-5 text-blue-600 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="text-sm font-medium">
                    {profileData.stats.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Properties
                  </span>
                  <span className="text-sm font-medium">
                    {profileData.stats.totalProperties}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-sm font-medium">
                    {profileData.stats.totalBookings}
                  </span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Pending Feedbacks
                  </span>
                  <span className="text-sm font-medium">
                    {profileData.stats.pendingFeedbacks}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

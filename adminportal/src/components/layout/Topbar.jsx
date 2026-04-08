import { useState, useEffect } from 'react';
import {
  FiMenu,
  FiBell,
  FiUser,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMoreVertical,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { notificationApi } from '../../utils/notificationApi';

const Topbar = ({ toggleSidebar, isDark, toggleDark, navigate }) => {
  const appContext = useAppContext() || {};
  const {
    adminProfile = null,
    currentUser = null,
    refreshAdminProfile = async () => ({ success: false }),
    logout = () => {},
  } = appContext;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Refresh profile data when component mounts
  useEffect(() => {
    if (!adminProfile && currentUser) {
      refreshAdminProfile();
    }
  }, [adminProfile, currentUser, refreshAdminProfile]);

  // Use adminProfile if available, fallback to currentUser, then default
  const profileData = adminProfile ||
    currentUser || { name: 'Admin User', email: 'admin@roomsathi.com' };
  const displayName = profileData.name || 'Admin User';
  const displayEmail = profileData.email || 'admin@roomsathi.com';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!localStorage.getItem('token')) return;
    const res = await notificationApi.getNotifications();
    if (res.success) {
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    if (currentUser && localStorage.getItem('token')) {
      loadNotifications();
    }
  }, [currentUser]);

  // Auto-refresh admin notifications so no manual reload is needed
  useEffect(() => {
    if (!currentUser || !localStorage.getItem('token')) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    await notificationApi.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    loadNotifications();
  };

  const handleClearAllNotifications = async () => {
    await notificationApi.clearAll();
    loadNotifications();
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfile(false);
    navigate('/profile');
  };

  return (
    <div
      className={`
      h-16 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-xl
      ${
        isDark
          ? 'bg-gray-900/95 border-gray-700'
          : 'bg-white/95 border-gray-200'
      }
    `}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 lg:hidden
            ${
              isDark
                ? 'hover:bg-gray-800 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label="Toggle sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className={`
            p-2 rounded-xl transition-all duration-200 hover:scale-105
            ${
              isDark
                ? 'hover:bg-gray-800 text-yellow-400'
                : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <FiSun className="w-5 h-5" />
          ) : (
            <FiMoon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showProfile) setShowProfile(false);
            }}
            className={`
              p-2 rounded-xl transition-all duration-200 hover:scale-105 relative
              ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }
            `}
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`
              absolute right-0 w-80 mt-3 rounded-2xl shadow-2xl overflow-hidden z-50 border backdrop-blur-xl
              ${
                isDark
                  ? 'bg-gray-800/95 border-gray-700'
                  : 'bg-white/95 border-gray-200'
              }
              animate-in slide-in-from-top-5 duration-200
            `}
            >
              <div
                className={`px-6 py-4 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                      className={`
                        px-6 py-4 border-b transition-colors duration-150 cursor-pointer
                        ${
                          isDark
                            ? 'hover:bg-gray-700/50 border-gray-700'
                            : 'hover:bg-gray-50 border-gray-100'
                        }
                        ${
                          !notification.isRead
                            ? 'bg-blue-50/50 dark:bg-blue-900/20'
                            : ''
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`
                          w-2 h-2 rounded-full mt-2 flex-shrink-0
                          ${
                            !notification.isRead
                              ? 'bg-blue-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }
                        `}
                        ></div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div
                className={`px-6 py-4 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleMarkAllAsRead}
                    className={`text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={handleClearAllNotifications}
                    className={`text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              if (showNotifications) setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Profile menu"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold shadow-lg">
                A
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <FiMoreVertical
              className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } hidden sm:block`}
            />
          </button>

          {showProfile && (
            <div
              className={`
              absolute right-0 w-64 mt-3 rounded-2xl shadow-2xl overflow-hidden z-50 border backdrop-blur-xl
              ${
                isDark
                  ? 'bg-gray-800/95 border-gray-700'
                  : 'bg-white/95 border-gray-200'
              }
              animate-in slide-in-from-top-5 duration-200
            `}
            >
              <div
                className={`px-6 py-4 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {avatarLetter}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {displayName}
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } truncate`}
                    >
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleProfileClick}
                  className={`
                    w-full flex items-center px-6 py-3 text-sm transition-colors duration-150
                    ${
                      isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <FiUser className="mr-3 h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className={`
                    w-full flex items-center px-6 py-3 text-sm transition-colors duration-150
                    ${
                      isDark
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;

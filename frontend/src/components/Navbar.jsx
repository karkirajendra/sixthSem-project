import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaHome, FaBars, FaTimes, FaSignOutAlt, FaHeart, FaList, FaPlus, FaBell } from 'react-icons/fa';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '../api/api';

// Define the waving hand animation styles
const waveAnimation = `
  @keyframes wave {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
    60% { transform: rotate(0deg); }
    100% { transform: rotate(0deg); }
  }
  
  .wave-hand {
    display: inline-block;
    animation: wave 2s infinite;
    transform-origin: 70% 70%;
    margin-right: 4px;
  }
`;

const Navbar = () => {
  const { currentUser, isLoggedIn, isBuyer, isSeller, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.notifications);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [isLoggedIn]);

  // Keep notification badge/dropdown fresh without page reload
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = waveAnimation;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || location.pathname !== '/' 
          ? 'bg-white shadow-md py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaHome className={`text-2xl ${
            scrolled || location.pathname !== '/' 
              ? 'text-blue-500 hover:text-blue-600'
              : 'text-white'
          }`} />
          <span className={`text-xl font-bold ${
            scrolled || location.pathname !== '/' 
              ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 bg-clip-text text-transparent' 
              : 'text-white'
          }`}>
            RoomSathi
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <Link 
              to="/properties" 
              className={`${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              } hover:text-primary-500 transition-colors`}
            >
              Properties
            </Link>
            {isActive('/properties') && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            )}
          </div>
          
          <div className="relative">
            <Link 
              to="/about" 
              className={`${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              } hover:text-primary-500 transition-colors`}
            >
              About Us
            </Link>
            {isActive('/about') && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            )}
          </div>
          
          <div className="relative">
            <Link 
              to="/blog" 
              className={`${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              } hover:text-primary-500 transition-colors`}
            >
              Blog
            </Link>
            {isActive('/blog') && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            )}
          </div>

          <div className="relative">
            <Link
              to="/contact"
              className={`${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              } hover:text-primary-500 transition-colors`}
            >
              Contact
            </Link>
            {isActive('/contact') && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            )}
          </div>
      
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className={`relative ${
                    scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
                  } hover:opacity-80 transition-opacity`}
                  aria-label="Notifications"
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg transition-all duration-200 ${
                    isNotificationsOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await markAllNotificationsAsRead();
                          loadNotifications();
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={async () => {
                          await clearAllNotifications();
                          loadNotifications();
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-500">No notifications yet</p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={async () => {
                            if (!notification.isRead) {
                              await markNotificationAsRead(notification._id);
                              loadNotifications();
                            }
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className={`flex items-center space-x-2 ${
                    scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
                  } hover:opacity-80 transition-opacity`}
                >
                  <span className="flex items-center">
                    <span className="wave-hand">👋</span>
                    <span>Hi, {currentUser.name}</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaUser className="text-primary-600" />
                  </div>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 transition-all duration-200 ${
                    isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                  }`}
                >
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <span className="wave-hand">👋</span>
                    <div className="ml-1">
                      <p className="text-sm font-medium text-gray-900">Hi, {currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                {isBuyer && (
                  <div className="py-2">
                    <Link to="/buyer/dashboard" className="dropdown-item">
                      <FaHome className="text-primary-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/buyer/wishlist" className="dropdown-item">
                      <FaHeart className="text-red-500" />
                      <span>My Wishlist</span>
                    </Link>
                  </div>
                )}

                {isSeller && (
                  <div className="py-2">
                    <Link to="/seller/dashboard" className="dropdown-item">
                      <FaHome className="text-primary-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/seller/listings" className="dropdown-item">
                      <FaList className="text-green-500" />
                      <span>My Listings</span>
                    </Link>
                    <Link to="/seller/add-property" className="dropdown-item">
                      <FaPlus className="text-blue-500" />
                      <span>Add Property</span>
                    </Link>
                  </div>
                )}

                <div className="py-2 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="dropdown-item text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="flex items-center space-x-2">
              <a
                href={import.meta.env.VITE_APP_ADMIN_PORTAL_URL || 'http://localhost:4100'}
                className={`text-sm ${
                  scrolled || location.pathname !== '/' 
                    ? 'text-gray-500 hover:text-primary-600' 
                    : 'text-white/80 hover:text-white'
                } transition-colors`}
                title="Admin Panel"
              >
                Admin
              </a>
              <Link 
                to="/login" 
                className={`${
                  scrolled || location.pathname !== '/' 
                    ? 'border-primary-600 text-primary-600 hover:bg-primary-50' 
                    : 'border-white text-white hover:bg-white hover:text-primary-600'
                } border px-4 py-2 rounded-md transition-colors`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`${
                  scrolled || location.pathname !== '/' 
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg hover:shadow-teal-500/30 transition-all duration-300' 
                    : 'bg-white text-primary-600 hover:bg-gray-100'
                } px-4 py-2 rounded-md transition-colors`}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FaTimes 
              className={`text-2xl ${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              }`} 
            />
          ) : (
            <FaBars 
              className={`text-2xl ${
                scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'
              }`} 
            />
          )}
        </button>

        <div 
          className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <div 
          className={`md:hidden fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center space-x-2">
                <FaHome className="text-2xl text-primary-600" />
                <span className="text-xl font-bold text-primary-600">RoomSathi</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <Link 
                to="/properties" 
                className={`block py-2 ${isActive('/properties') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              <Link 
                to="/blog" 
                className={`block py-2 ${isActive('/blog') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/about" 
                className={`block py-2 ${isActive('/about') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <a
                href={import.meta.env.VITE_APP_ADMIN_PORTAL_URL || 'http://localhost:4100'}
                className="block py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </a>

              {isLoggedIn ? (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center">
                        <span className="wave-hand">👋</span>
                        <div>
                          <p className="font-medium text-gray-900">Hi, {currentUser.name}</p>
                          <p className="text-sm text-gray-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <FaUser className="text-primary-600" />
                      </div>
                    </div>

                    {isBuyer && (
                      <>
                        <Link 
                          to="/buyer/dashboard" 
                          className={`block py-2 ${isActive('/buyer/dashboard') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/buyer/wishlist" 
                          className={`block py-2 ${isActive('/buyer/wishlist') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Wishlist
                        </Link>
                      </>
                    )}

                    {isSeller && (
                      <>
                        <Link 
                          to="/seller/dashboard" 
                          className={`block py-2 ${isActive('/seller/dashboard') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/seller/listings" 
                          className={`block py-2 ${isActive('/seller/listings') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Listings
                        </Link>
                        <Link 
                          to="/seller/add-property" 
                          className={`block py-2 ${isActive('/seller/add-property') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Add Property
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full mt-4 text-left py-2 text-red-600 hover:text-red-700 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full py-2 text-center text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-2 text-center text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-md shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
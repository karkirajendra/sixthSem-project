import { useState, useEffect } from 'react';
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiPlusCircle,
  FiFileText,
  FiMessageSquare,
  FiMail,
  FiBookmark,
  FiCalendar,
  FiX,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Sidebar = ({ isOpen, toggleSidebar, isDark, navigate }) => {
  const { adminProfile, currentUser, refreshAdminProfile } = useAppContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeItem, setActiveItem] = useState(window.location.pathname);

  // Use adminProfile if available, fallback to currentUser, then default
  const profileData = adminProfile ||
    currentUser || { name: 'Admin User', email: 'admin@roomsathi.com' };
  const displayName = profileData.name || 'Admin User';
  const displayEmail = profileData.email || 'admin@roomsathi.com';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Refresh profile data when component mounts
  useEffect(() => {
    if (!adminProfile && currentUser) {
      refreshAdminProfile();
    }
  }, [adminProfile, currentUser, refreshAdminProfile]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 768 && !isOpen) {
        toggleSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
    },
    { path: '/users', name: 'Users', icon: <FiUsers className="w-5 h-5" /> },
    {
      path: '/listings',
      name: 'Listings',
      icon: <FiGrid className="w-5 h-5" />,
    },
    {
      path: '/add-listings',
      name: 'Add Listings',
      icon: <FiPlusCircle className="w-5 h-5" />,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      icon: <FiBarChart2 className="w-5 h-5" />,
    },
    { path: '/pages', name: 'Pages', icon: <FiFileText className="w-5 h-5" /> },
    {
      path: '/feedback',
      name: 'Feedback',
      icon: <FiMessageSquare className="w-5 h-5" />,
    },
    { path: '/contact', name: 'Contact', icon: <FiMail className="w-5 h-5" /> },
    {
      path: '/profile',
      name: 'Profile Settings',
      icon: <FiSettings className="w-5 h-5" />,
    },
  ];

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigate(path);
    if (isMobile) {
      toggleSidebar(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out flex flex-col
          ${
            isDark
              ? 'bg-gray-900 border-gray-700 shadow-2xl'
              : 'bg-white border-gray-200 shadow-xl'
          }
          ${isOpen ? 'w-72' : 'w-20'} 
          ${
            isMobile
              ? isOpen
                ? 'translate-x-0'
                : '-translate-x-full'
              : 'translate-x-0'
          }
          border-r
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between h-16 px-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div
            className={`transition-all duration-300 ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 invisible'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1
                  className={`text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent`}
                >
                  RoomSathi
                </h1>
                <p
                  className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Admin Panel
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105
              ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }
              ${isMobile ? 'absolute right-4' : ''}
            `}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isMobile && isOpen ? (
              <FiX className="w-5 h-5" />
            ) : isOpen ? (
              <FiChevronLeft className="w-5 h-5" />
            ) : (
              <FiChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <ul className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      group relative overflow-hidden
                      ${
                        isActive
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 shadow-md border border-blue-200'
                          : isDark
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${!isOpen && !isMobile ? 'justify-center' : ''}
                      hover:scale-105 transform
                    `}
                    title={!isOpen ? item.name : undefined}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-xl"></div>
                    )}
                    <span className="flex items-center relative z-10">
                      <span
                        className={`transition-all duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`
                        ml-3 transition-all duration-300
                        ${
                          isOpen
                            ? 'opacity-100 visible translate-x-0'
                            : 'opacity-0 invisible -translate-x-4 w-0'
                        }
                        ${
                          isMobile
                            ? 'opacity-100 visible w-auto translate-x-0'
                            : ''
                        }
                      `}
                      >
                        {item.name}
                      </span>
                    </span>
                    {isActive && isOpen && (
                      <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div
          className={`
          p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}
          ${isDark ? 'bg-gray-900' : 'bg-white'}
        `}
        >
          <div
            onClick={() => handleNavigation('/profile')}
            className={`flex items-center p-2 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 ${
              isDark
                ? 'bg-gradient-to-r from-gray-800 to-gray-700'
                : 'bg-gradient-to-r from-blue-50 to-teal-50'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {avatarLetter}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div
              className={`ml-3 transition-all duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            >
              <p
                className={`text-sm font-semibold truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {displayName}
              </p>
              <p
                className={`text-xs truncate ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

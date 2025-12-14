import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaHome, FaBars, FaTimes, FaSignOutAlt, FaHeart, FaList, FaPlus } from 'react-icons/fa';

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
  const location = useLocation();
  const profileRef = useRef(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

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
      
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
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
          ) : (
            <div className="flex items-center space-x-2">
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
              <Link 
                to="/contact" 
                className={`block py-2 ${isActive('/contact') ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                
              </Link>

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
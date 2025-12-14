// src/pages/buyer/BuyerSidebar.jsx
import { NavLink } from 'react-router-dom';
import { FaHome, FaHeart, FaEnvelope, FaUser, FaTimes, FaBars, FaComments } from 'react-icons/fa';
import { useState } from 'react';

const BuyerSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const links = [
    { to: '/buyer/dashboard', icon: <FaHome className="mr-3" />, text: 'Dashboard' },
    { to: '/buyer/wishlist', icon: <FaHeart className="mr-3" />, text: 'My Wishlist' },
    { to: '/buyer/messages', icon: <FaComments className="mr-3" />, text: 'Messages' },
    { to: '/buyer/profile', icon: <FaUser className="mr-3" />, text: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-20 right-4 z-40">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white shadow-md focus:outline-none"
          aria-label="Toggle sidebar"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:sticky top-20 z-30 h-[calc(100vh-5rem)] w-64 bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Tenant Dashboard</h2>
        </div>
        
        <nav className="py-4">
          <ul>
            {links.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => 
                    `flex items-center px-5 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.text}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default BuyerSidebar;
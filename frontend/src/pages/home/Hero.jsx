// src/pages/home/Hero.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaHome, FaSearch } from 'react-icons/fa';
import SuperSearchBar from '../../components/superSearch/SuperSearchBar';

const Hero = () => {
  const navigate = useNavigate();
  
  const handleSearchResults = async (results, query) => {
  if (!results || !query) {
    // If no results or query, navigate to properties page without super search
    navigate('/properties');
    return;
  }
  
  // Navigate to properties page with super search query as URL parameter
  // The PropertiesPage will handle the actual search when it detects the parameter
  navigate(`/properties?superSearch=${encodeURIComponent(query)}`);
};

  return (
    <div className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/90 to-teal-700/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl text-center mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8 border border-white/30">
              <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-white text-xs sm:text-sm font-medium">
                Nepal's Trusted Property Finder & Booking Platform
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6">
              <span className="block">Find Your Perfect</span>
              <span className="block bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Living Space
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Discover comfortable homes across Nepal with 
              <span className="font-semibold text-teal-300"> RoomSathi</span> {" "} 
              From cozy rooms to modern apartments, find your ideal flat
            </p>
            
            {/* Super Search Bar */}
            <div className="mb-8 sm:mb-10 px-4 sm:px-0">
              <SuperSearchBar onSearchResults={handleSearchResults} />
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-16 px-4 sm:px-0">
              <Link 
                to="/properties" 
                className="group bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
              >
                <FaSearch className="mr-2" />
                Browse Properties
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/register" 
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
              >
                <FaHome className="mr-2" />
                List Your Property
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator - Hidden on mobile */}
      <div className="hidden md:block absolute bottom-[100px] left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-gradient-to-b from-white to-transparent rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ sidebarOpen, toggleSidebar, isDark, toggleDark }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        toggleSidebar(false);
      } else {
        toggleSidebar(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [toggleSidebar]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDark]);

  return (
    <div className={`flex h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isDark={isDark}
        navigate={navigate}
      />
      
      <div className={`
        flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}
      `}>
        <Topbar 
          toggleSidebar={toggleSidebar} 
          isDark={isDark} 
          toggleDark={toggleDark}
          navigate={navigate}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ isDark }} />
          </div>
        </main>
        
        <footer className={`
          p-4 border-t text-center text-sm backdrop-blur-xl transition-colors duration-300
          ${isDark 
            ? 'bg-gray-900/95 border-gray-700 text-gray-400' 
            : 'bg-white/95 border-gray-200 text-gray-500'
          }
        `}>
          &copy; {new Date().getFullYear()} RoomSathi Admin Dashboard. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
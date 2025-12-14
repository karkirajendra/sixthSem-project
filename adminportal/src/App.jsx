import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Listings from './pages/Listings';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AddListings from './pages/AddProperty';
import Pages from './pages/Pages';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  return (
    <AppProvider>
      <Router>
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: isDark ? 'dark:bg-gray-800 dark:text-white' : '',
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login isDark={isDark} />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout 
                  sidebarOpen={sidebarOpen} 
                  toggleSidebar={toggleSidebar}
                  isDark={isDark}
                  toggleDark={toggleDark}
                />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard isDark={isDark} />} />
            <Route path="users" element={<Users isDark={isDark} />} />
            <Route path="listings" element={<Listings isDark={isDark} />} />
            <Route path="add-listings" element={<AddListings isDark={isDark} />} />
            <Route path="analytics" element={<Analytics isDark={isDark} />} />
            <Route path="pages/*" element={<Pages isDark={isDark} />} />
            <Route path="feedback" element={<Feedback isDark={isDark} />} />
            <Route path="contact" element={<Contact isDark={isDark} />} />
            <Route path="profile" element={<Profile isDark={isDark} />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
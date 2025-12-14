import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
} from '../api/api';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching user profile
          const result = await getUserProfile();
          if (result.success) {
            setCurrentUser(result.user);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Failed to verify auth status', error);
          // Clear invalid credentials
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password);

      if (result.success) {
        setCurrentUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local state
      setCurrentUser(null);
      return { success: true };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await registerUser(userData);

      if (result.success) {
        setCurrentUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Context value
  const value = {
    currentUser,
    login,
    logout,
    register,
    isLoggedIn: !!currentUser,
    isBuyer: currentUser?.role === 'buyer',
    isSeller: currentUser?.role === 'seller',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

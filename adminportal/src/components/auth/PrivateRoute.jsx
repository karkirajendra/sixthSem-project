import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Primary check: React state (currentUser set after login)
  if (currentUser && currentUser.role === 'admin') {
    return children;
  }

  // Fallback check: localStorage (handles brief window right after login
  // before React state update is reflected in the component tree)
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.role === 'admin') {
        return children;
      }
    }
  } catch (_) {
    // ignore JSON parse errors
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;

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

  return currentUser && currentUser.role === 'admin' ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/signin', { replace: true });
      } else if (!isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Only render children if authenticated and admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
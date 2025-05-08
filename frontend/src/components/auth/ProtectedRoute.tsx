import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'pharmacy' | 'doctor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, isPharmacy, isDoctor, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'pharmacy' && isPharmacy) ||
      (requiredRole === 'doctor' && isDoctor);

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on role
      if (isAdmin) return <Navigate to="/admin" replace />;
      if (isPharmacy) return <Navigate to="/pharmacy/dashboard" replace />;
      if (isDoctor) return <Navigate to="/doctor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
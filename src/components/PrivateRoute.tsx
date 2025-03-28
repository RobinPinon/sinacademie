import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user || !session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 
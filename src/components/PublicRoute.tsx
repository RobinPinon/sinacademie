import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (user && session) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
};

export default PublicRoute; 
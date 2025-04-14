import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import NotApproved from '../pages/NotApproved';

interface ApprovedRouteProps {
  children: React.ReactNode;
}

const ApprovedRoute = ({ children }: ApprovedRouteProps) => {
  const { user, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isApproved) {
    return <NotApproved />;
  }

  return <>{children}</>;
};

export default ApprovedRoute; 
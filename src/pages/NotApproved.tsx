import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const NotApproved = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Accès non autorisé
          </Typography>
          <Typography variant="h6" gutterBottom>
            Bonjour {user?.email},
          </Typography>
          <Typography variant="body1" paragraph>
            Votre compte n'est pas encore approuvé pour accéder aux fonctionnalités du site.
          </Typography>
          <Typography variant="body1" paragraph>
            Pour obtenir l'accès, veuillez contacter Sopralus à l'adresse suivante :
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            contact@sopralus.com
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Nous vous remercions de votre compréhension.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotApproved; 
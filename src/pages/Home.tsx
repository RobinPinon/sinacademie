import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Bienvenue sur Summoners War Academy
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
            Votre compagnon pour progresser dans Summoners War
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Gestion de votre compte
                </Typography>
                <Typography paragraph>
                  Créez un compte pour sauvegarder vos données et accéder à toutes les fonctionnalités.
                </Typography>
                {!user ? (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    fullWidth
                  >
                    Créer un compte
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/profile')}
                    fullWidth
                  >
                    Accéder à mon profil
                  </Button>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Importez vos données
                </Typography>
                <Typography paragraph>
                  Importez facilement vos données de jeu au format JSON pour les analyser et les optimiser.
                </Typography>
                {user ? (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/profile')}
                    fullWidth
                  >
                    Importer mes données
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    fullWidth
                  >
                    Se connecter pour importer
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 
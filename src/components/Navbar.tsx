import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar disableGutters sx={{ px: 2 }}>
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        >
          Summoners War Academy
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color="inherit" component={RouterLink} to="/bestiary">
            Bestiaire
          </Button>
          {user && (
            <Button color="inherit" component={RouterLink} to="/counter">
              Counter
            </Button>
          )}
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/profile">
                Profil
              </Button>
              {isAdmin && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Admin
                </Button>
              )}
              <Button
                color="inherit"
                onClick={handleLogout}
                className="logout-button"
                variant="outlined"
                sx={{
                  color: '#dc004e',
                  borderColor: '#dc004e',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#dc004e',
                    borderColor: '#dc004e',
                    opacity: 0.8,
                  },
                }}
              >
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Connexion
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Inscription
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
import React, { useEffect } from 'react';
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

const pages = [
  { name: 'Counter', path: '/counter', requireAuth: true },
  { name: 'Builds', path: '/builds', requireAuth: true},
];

const Navbar = () => {
  const { user, logout, isAdmin, isMaintainer, refreshUserStatus } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Petit délai pour s'assurer que la session est bien établie
      const timer = setTimeout(() => {
        refreshUserStatus();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, refreshUserStatus]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Summoners War Academy
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          {/* Navigation links */}
          {pages.map((page) => {
            if (page.public || (user && page.requireAuth)) {
              return (
                <Button
                  key={page.path}
                  color="inherit"
                  component={RouterLink}
                  to={page.path}
                  startIcon={page.icon}
                >
                  {page.name}
                </Button>
              );
            }
            return null;
          })}

          {/* User menu */}
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
              <Button color="inherit" onClick={handleLogout}>
                Déconnexion
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
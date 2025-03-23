import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { supabase } from '../supabase/config';

const Profile = () => {
  const { user, logout } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          // Insérer les données dans la table user_data
          const { error } = await supabase
            .from('user_data')
            .upsert({
              user_id: user?.id,
              data: jsonData,
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;

          setSuccess('Données importées avec succès !');
          setError('');
        } catch (err) {
          setError('Erreur lors de l\'import des données. Vérifiez le format du fichier JSON.');
          setSuccess('');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Erreur lors de la lecture du fichier.');
      setSuccess('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Erreur lors de la déconnexion.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Profil
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Email: {user?.email}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <input
                accept="application/json"
                style={{ display: 'none' }}
                id="json-file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="json-file-upload">
                <Button
                  variant="contained"
                  component="span"
                  sx={{ mr: 2 }}
                >
                  Importer un fichier JSON
                </Button>
              </label>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 
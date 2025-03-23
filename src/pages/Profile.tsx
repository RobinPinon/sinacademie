import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { supabase } from '../supabase/config';

// Fonction pour calculer un hash simple des données
const calculateHash = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState<{
    file_name?: string;
    updated_at?: string;
  } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('file_name, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserData(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const dataHash = calculateHash(jsonData);

          // Vérifier si ces données existent déjà pour un autre utilisateur
          const { data: existingData, error: checkError } = await supabase
            .from('user_data')
            .select('user_id')
            .eq('data_hash', dataHash)
            .neq('user_id', user?.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          if (existingData) {
            setError('Ces données ont déjà été importées par un autre utilisateur.');
            setSuccess('');
            return;
          }
          
          // Mettre à jour les données existantes
          const { error } = await supabase
            .from('user_data')
            .upsert({
              user_id: user?.id,
              data: jsonData,
              data_hash: dataHash,
              file_name: file.name,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (error) throw error;

          setSuccess('Données mises à jour avec succès !');
          setError('');
          fetchUserData(); // Rafraîchir les données affichées
        } catch (err) {
          setError('Erreur lors de la mise à jour des données. Vérifiez le format du fichier JSON.');
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1">
                Email: {user?.email}
              </Typography>
              <Chip 
                label={isAdmin ? "Administrateur" : "Utilisateur"} 
                color={isAdmin ? "primary" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fichier JSON importé
              </Typography>
              {userData ? (
                <>
                  <Typography variant="body1" color="text.secondary">
                    Nom du fichier: {userData.file_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Dernière mise à jour: {new Date(userData.updated_at).toLocaleString('fr-FR')}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Aucun fichier JSON importé
                </Typography>
              )}
            </Box>
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
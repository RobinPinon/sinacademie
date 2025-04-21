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
import { JsonImportButton } from '../components/JsonImportButton';

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

  const handleJsonImport = async (jsonData: any, fileName: string) => {
    if (!user?.id) return;

    try {
      // Vérifier que les données ne sont pas null
      if (!jsonData) {
        setError('Les données JSON sont invalides');
        return;
      }

      // Vérifier la taille des données
      const dataSize = new Blob([JSON.stringify(jsonData)]).size;
      if (dataSize > 10 * 1024 * 1024) { // 10MB limit
        setError('Le fichier est trop volumineux (limite: 10MB)');
        return;
      }

      // Calculer le hash des données
      const dataHash = calculateHash(jsonData);

      const { error } = await supabase
        .from('user_data')
        .upsert(
          {
            id: user.id, // Utiliser l'ID de l'utilisateur comme ID principal
            user_id: user.id,
            data: jsonData,
            data_hash: dataHash,
            file_name: fileName,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'id'
          }
        );

      if (error) {
        console.error('Erreur Supabase détaillée:', error);
        if (error.code === '23502') {
          setError('Données manquantes requises');
        } else if (error.code === '23505') {
          setError('Conflit avec des données existantes');
        } else {
          setError(`Erreur lors de l'importation: ${error.message}`);
        }
        return;
      }

      setSuccess('Données importées avec succès !');
      setError('');
      await fetchUserData();
    } catch (err: any) {
      console.error('Erreur complète:', err);
      setError(err?.message || 'Erreur lors de l\'importation des données');
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
                    Dernière mise à jour: {userData.updated_at ? new Date(userData.updated_at).toLocaleString('fr-FR') : 'Non disponible'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Aucun fichier JSON importé
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 3 }}>
              <JsonImportButton 
                onImport={handleJsonImport}
                label="Importer votre fichier JSON"
              />
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                sx={{ ml: 2 }}
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
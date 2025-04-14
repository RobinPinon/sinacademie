import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { supabase } from '../supabase/config';

interface User {
  id: string;
  email: string;
  is_approved: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Récupération des utilisateurs...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération:', error);
        throw error;
      }
      console.log('Utilisateurs récupérés:', data);
      setUsers(data || []);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement des utilisateurs.');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      console.log('Tentative d\'approbation pour l\'utilisateur:', userId);
      
      // Vérifier d'abord si l'utilisateur existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkError) {
        console.error('Erreur de vérification:', checkError);
        throw new Error('Utilisateur non trouvé');
      }

      console.log('Données actuelles de l\'utilisateur:', existingUser);

      // Mettre à jour le statut d'approbation
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.error('Erreur de mise à jour:', updateError);
        throw updateError;
      }

      if (!updateData || updateData.length === 0) {
        console.error('Mise à jour effectuée mais aucune donnée retournée');
        throw new Error('Échec de la mise à jour');
      }

      console.log('Mise à jour réussie:', updateData);
      
      // Vérifier que la mise à jour a bien été effectuée
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (verifyError) {
        console.error('Erreur de vérification après mise à jour:', verifyError);
      } else {
        console.log('Données après mise à jour:', verifyData);
      }

      setSuccess('Utilisateur approuvé avec succès !');
      
      // Rafraîchir la liste des utilisateurs
      await fetchUsers();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setError(`Erreur lors de l'approbation de l'utilisateur: ${err.message}`);
      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Tableau de bord administrateur
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Date d'inscription</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.is_approved ? 'Approuvé' : 'En attente'}
                    </TableCell>
                    <TableCell>
                      {!user.is_approved && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleApproveUser(user.id)}
                        >
                          Approuver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 
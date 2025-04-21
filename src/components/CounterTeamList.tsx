import { useState, useEffect } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { AddCounterDialog } from './AddCounterDialog';
import { CounterTeamCard } from './CounterTeamCard';
import { CounterTeam, Monster } from '../types/Team';
import { supabase } from '../lib/supabaseClient';

export const CounterTeamList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [counterTeams, setCounterTeams] = useState<CounterTeam[]>([]);

  useEffect(() => {
    fetchCounterTeams();
  }, []);

  const fetchCounterTeams = async () => {
    const { data, error } = await supabase
      .from('counter_teams')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération des counters:', error);
      return;
    }

    setCounterTeams(data || []);
  };

  const handleAddCounter = async (name: string, monsters: Monster[], description: string) => {
    const { error } = await supabase
      .from('counter_teams')
      .insert([{ name, monsters, description }]);

    if (error) {
      console.error('Erreur lors de l\'ajout du counter:', error);
      return;
    }

    setIsDialogOpen(false);
    fetchCounterTeams();
  };

  return (
    <Box>
      <Button 
        variant="contained" 
        onClick={() => setIsDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        Ajouter un Counter
      </Button>

      <Grid container spacing={3}>
        {counterTeams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <CounterTeamCard team={team} />
          </Grid>
        ))}
      </Grid>

      <AddCounterDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddCounter}
      />
    </Box>
  );
}; 
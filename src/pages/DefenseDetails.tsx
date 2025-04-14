import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { DefenseTeam, CounterTeam, Monster } from '../types/Team';
import { getDefenseTeam, getCounterTeamsForDefense } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/config';

interface UserData {
  unit_list: {
    unit_master_id: number;
  }[];
}

const DefenseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [defenseTeam, setDefenseTeam] = useState<DefenseTeam | null>(null);
  const [counterTeams, setCounterTeams] = useState<CounterTeam[]>([]);
  const [userMonsters, setUserMonsters] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadDefenseDetails();
    }
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      loadUserMonsters();
    }
  }, [user?.id]);

  const loadDefenseDetails = async () => {
    try {
      const defense = await getDefenseTeam(id!);
      const counters = await getCounterTeamsForDefense(id!);
      setDefenseTeam(defense);
      setCounterTeams(counters);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const loadUserMonsters = async () => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const jsonData = data?.data as UserData;
      if (jsonData?.unit_list) {
        const monsterIds = jsonData.unit_list.map(unit => unit.unit_master_id);
        setUserMonsters(monsterIds);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des monstres:', err);
    }
  };

  const calculateCounterScore = (counter: CounterTeam) => {
    const availableMonsters = counter.monsters.filter(monster => 
      userMonsters.includes(monster.id)
    ).length;
    return availableMonsters;
  };

  const sortedCounters = [...counterTeams].sort((a, b) => {
    const scoreA = calculateCounterScore(a);
    const scoreB = calculateCounterScore(b);
    return scoreB - scoreA;
  });

  return (
    <Box sx={{ p: 3 }}>
      {defenseTeam && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Équipe de défense: {defenseTeam.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {defenseTeam.monsters.map((monster, index) => (
                  <Chip key={index} label={monster.name} />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom>
            Counters disponibles ({sortedCounters.length})
          </Typography>
          
          <Grid container spacing={3}>
            {sortedCounters.map((counter) => {
              const score = calculateCounterScore(counter);
              return (
                <Grid item xs={12} md={6} key={counter.id}>
                  <Card 
                    sx={{ 
                      bgcolor: score === 3 ? 'success.light' : 
                              score === 2 ? 'warning.light' : 
                              score === 1 ? 'error.light' : 'grey.300'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{counter.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        {counter.monsters.map((monster, index) => (
                          <Chip 
                            key={index} 
                            label={monster.name}
                            color={userMonsters.includes(monster.id) ? "success" : "default"}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Monstres disponibles: {score}/3
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DefenseDetails; 
import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { monsterData } from '../data/monsters';
import { getMonsterImagePath } from '../data/monsterImages';

const MonstersPage: React.FC = () => {
  // Convertir l'objet monsterData.names en tableau de monstres, filtrer et trier par ID
  const monsters = Object.entries(monsterData.names)
    .map(([id, name]) => ({
      id: parseInt(id),
      name: name
    }))
    .filter(monster => monster.id >= 500)
    .sort((a, b) => a.id - b.id);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bestiaire
      </Typography>
      <Grid container spacing={3}>
        {monsters.map((monster) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={monster.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src={getMonsterImagePath(monster.id)}
                  alt={monster.name}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'contain'
                  }}
                />
                <Typography variant="h6" component="h2" align="center">
                  {monster.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {monster.id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MonstersPage; 
import { Card, CardContent, Typography, Box } from '@mui/material';
import { CounterTeam } from '../types/Team';

interface CounterTeamCardProps {
  team: CounterTeam;
}

export const CounterTeamCard = ({ team }: CounterTeamCardProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {team.name}
        </Typography>
        
        <Box 
          dangerouslySetInnerHTML={{ __html: team.description }} 
          sx={{ 
            mt: 2,
            '& img': { maxWidth: '100%', height: 'auto' },
            '& p': { margin: 0 }
          }} 
        />

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Monstres:
          </Typography>
          {team.monsters.map((monster, index) => (
            <Typography key={index} variant="body2">
              • {monster.name}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 
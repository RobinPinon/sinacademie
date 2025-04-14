import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Autocomplete,
  TextField
} from '@mui/material';
import { monsterData } from '../data/monsters';
import { useAuth } from '../contexts/AuthContext';
import { DefenseTeam, CounterTeam, Monster } from '../types/Team';
import { createDefenseTeam, createCounterTeam, getDefenseTeams, getCounterTeamsForDefense } from '../services/teamService';
import { useNavigate } from 'react-router-dom';

const Counter: React.FC = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [openCounterDialog, setOpenCounterDialog] = useState(false);
  const [selectedDefenseTeam, setSelectedDefenseTeam] = useState<DefenseTeam | null>(null);
  const [selectedMonsters, setSelectedMonsters] = useState<(Monster | null)[]>([]);
  const [defenseTeams, setDefenseTeams] = useState<DefenseTeam[]>([]);
  const [counterTeams, setCounterTeams] = useState<CounterTeam[]>([]);
  const [defenseMonsters, setDefenseMonsters] = useState<Monster[]>([]);
  const [counterMonsters, setCounterMonsters] = useState<Monster[]>([]);
  const [searchResults, setSearchResults] = useState<DefenseTeam[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDefenseTeams();
  }, []);

  const loadDefenseTeams = async () => {
    const teams = await getDefenseTeams();
    setDefenseTeams(teams);
  };

  const handleAddClick = () => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter une équipe');
      return;
    }
    setOpenAddDialog(true);
  };

  const handleSearchClick = () => {
    if (!user) {
      alert('Veuillez vous connecter pour rechercher des monstres');
      return;
    }
    setOpenSearchDialog(true);
  };

  const monsters = Object.entries(monsterData.names)
    .filter(([id, name]) => {
      if (!name || name.trim() === '') return false;
      const numId = parseInt(id);
      return numId >= 10000 && numId < 100000;
    })
    .map(([id, name]) => ({
      id: parseInt(id),
      name: name.trim()
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((monster, index, self) =>
      index === self.findIndex((m) => m.name === monster.name)
    );

  const handleMonsterSelect = (monster: Monster | null, index: number) => {
    const newSelectedMonsters = [...selectedMonsters];
    newSelectedMonsters[index] = monster;
    setSelectedMonsters(newSelectedMonsters);
  };

  const handleDefenseMonsterSelect = (monster: Monster | null, index: number) => {
    const newDefenseMonsters = [...defenseMonsters];
    if (monster) {
      newDefenseMonsters[index] = monster;
    } else {
      newDefenseMonsters.splice(index, 1);
    }
    setDefenseMonsters(newDefenseMonsters);
  };

  const handleCounterMonsterSelect = (monster: Monster | null, index: number) => {
    const newCounterMonsters = [...counterMonsters];
    if (monster) {
      newCounterMonsters[index] = monster;
    } else {
      newCounterMonsters.splice(index, 1);
    }
    setCounterMonsters(newCounterMonsters);
  };

  const handleSaveDefenseTeam = async () => {
    if (defenseMonsters.length !== 3 || defenseMonsters.some(m => !m)) {
      alert('Veuillez sélectionner exactement 3 monstres pour l\'équipe de défense');
      return;
    }

    const teamName = defenseMonsters.map(m => m.name).join(' - ');
    await createDefenseTeam({
      name: teamName,
      monsters: defenseMonsters,
      userId: user!.id
    });

    setDefenseMonsters([]);
    setOpenAddDialog(false);
    loadDefenseTeams();
  };

  const handleSaveCounterTeam = async (defenseTeamId: string) => {
    if (counterMonsters.length !== 3 || counterMonsters.some(m => !m)) {
      alert('Veuillez sélectionner exactement 3 monstres pour l\'équipe de counter');
      return;
    }

    const teamName = counterMonsters.map(m => m.name).join(' - ');
    await createCounterTeam({
      name: teamName,
      monsters: counterMonsters,
      userId: user!.id,
      defenseTeamId
    });

    setCounterMonsters([]);
    loadDefenseTeams();
  };

  const handleAddTeam = () => {
    if (defenseMonsters.length > 0 && counterMonsters.length > 0 && user) {
      const teamId = Date.now().toString();
      const teamName = defenseMonsters.map(m => m.name).join(' - ');
      const counterTeamName = counterMonsters.map(m => m.name).join(' - ');
      
      const newDefenseTeam: DefenseTeam = {
        id: teamId,
        name: teamName,
        monsters: defenseMonsters,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        counters: []
      };
      
      const newCounterTeam: CounterTeam = {
        id: teamId,
        name: counterTeamName,
        monsters: counterMonsters,
        userId: user.id,
        defenseTeamId: teamId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setDefenseTeams([...defenseTeams, newDefenseTeam]);
      setCounterTeams([...counterTeams, newCounterTeam]);
      setDefenseMonsters([]);
      setCounterMonsters([]);
      setOpenAddDialog(false);
    }
  };

  const handleSearch = () => {
    const validSelectedMonsters = selectedMonsters.filter((m): m is Monster => m !== null);
    if (validSelectedMonsters.length > 0) {
      const matchingTeams = defenseTeams.filter(team => 
        team.monsters.some(monster => 
          validSelectedMonsters.some(selected => selected.id === monster.id)
        )
      );
      setSearchResults(matchingTeams);
      setOpenSearchDialog(false);
    }
  };

  const handleAddCounter = (team: DefenseTeam) => {
    setSelectedDefenseTeam(team);
    setOpenCounterDialog(true);
  };

  const handleDefenseClick = (team: DefenseTeam) => {
    navigate(`/defense/${team.id}`);
  };

  const renderMonsterSelect = (index: number, selectedMonster: Monster | null, onChange: (monster: Monster | null, index: number) => void) => (
    <Autocomplete
      value={selectedMonster}
      onChange={(_, newValue) => onChange(newValue, index)}
      options={monsters}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Monstre ${index + 1}`}
          fullWidth
          placeholder="Rechercher un monstre..."
        />
      )}
      sx={{ width: '100%' }}
      filterOptions={(options, { inputValue }) => {
        const searchTerm = inputValue.toLowerCase();
        return options.filter(option => 
          option.name.toLowerCase().includes(searchTerm)
        );
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleAddClick}>
          Ajouter
        </Button>
        <Button variant="contained" onClick={handleSearchClick}>
          Rechercher
        </Button>
      </Box>

      {/* Dialog pour ajouter une équipe */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter une équipe</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Équipe de défense</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {[0, 1, 2].map((index) => renderMonsterSelect(
                index,
                defenseMonsters[index],
                handleDefenseMonsterSelect
              ))}
            </Box>
            <Button 
              variant="contained" 
              onClick={handleSaveDefenseTeam} 
              disabled={defenseMonsters.length !== 3 || defenseMonsters.some(m => !m)}
            >
              Sauvegarder l'équipe de défense
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog pour rechercher des monstres */}
      <Dialog open={openSearchDialog} onClose={() => setOpenSearchDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rechercher des monstres</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[0, 1, 2].map((index) => renderMonsterSelect(
              index,
              selectedMonsters[index],
              handleMonsterSelect
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un counter */}
      <Dialog open={openCounterDialog} onClose={() => setOpenCounterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un counter pour {selectedDefenseTeam?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Équipe counter</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {[0, 1, 2].map((index) => renderMonsterSelect(
                index,
                counterMonsters[index],
                handleCounterMonsterSelect
              ))}
            </Box>
            <Button 
              variant="contained" 
              onClick={() => {
                if (selectedDefenseTeam) {
                  handleSaveCounterTeam(selectedDefenseTeam.id);
                  setOpenCounterDialog(false);
                }
              }}
              disabled={counterMonsters.length !== 3 || counterMonsters.some(m => !m)}
            >
              Sauvegarder l'équipe counter
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Liste des équipes de défense */}
      <Grid container spacing={3}>
        {defenseTeams.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => handleDefenseClick(team)}
            >
              <CardContent>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monstres: {team.monsters.map(m => m.name).join(', ')}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCounter(team);
                  }}
                  sx={{ mt: 2 }}
                >
                  Ajouter un counter
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Counter; 
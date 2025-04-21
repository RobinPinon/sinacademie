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
  TextField,
  Alert,
  useTheme
} from '@mui/material';
import { monsterData } from '../data/monsters';
import { useAuth } from '../contexts/AuthContext';
import { DefenseTeam, CounterTeam, Monster } from '../types/Team';
import { createDefenseTeam, createCounterTeam, getDefenseTeams, getCounterTeamsForDefense } from '../services/teamService';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { getMonsterImagePath } from '../data/monsterImages';

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
  const { user, isMaintainer } = useAuth();
  const navigate = useNavigate();
  const editorRef = React.useRef<any>(null);
  const theme = useTheme();
  const [originalDefenseTeams, setOriginalDefenseTeams] = useState<DefenseTeam[]>([]);

  useEffect(() => {
    loadDefenseTeams();
  }, []);

  const loadDefenseTeams = async () => {
    const teams = await getDefenseTeams();
    setDefenseTeams(teams);
    setOriginalDefenseTeams(teams);
  };

  const handleAddClick = () => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter une équipe');
      return;
    }
    if (!isMaintainer) {
      alert('Vous devez être maintainer pour ajouter une équipe de défense');
      return;
    }
    setOpenAddDialog(true);
  };

  const handleSearchClick = () => {
    if (!user) {
      alert('Veuillez vous connecter pour rechercher des monstres');
      return;
    }
    setSelectedMonsters([null, null, null]);
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

    const teamName = defenseMonsters.map(m => m.name).join(" - ");
    const teamSlug = defenseMonsters
      .map(m => m.name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ""))
      .join("-");
    
    try {
      await createDefenseTeam({
        name: teamName,
        monsters: defenseMonsters,
        user_id: user!.id,
        slug: teamSlug
      });

      setDefenseMonsters([]);
      setOpenAddDialog(false);
      loadDefenseTeams();
    } catch (err) {
      console.error('Erreur lors de la création de l\'équipe:', err);
      alert('Erreur lors de la création de l\'équipe');
    }
  };

  const handleSaveCounterTeam = async (defenseTeamId: string, name: string, description: string) => {
    if (counterMonsters.length !== 3 || counterMonsters.some(m => !m)) {
      alert('Veuillez sélectionner exactement 3 monstres pour l\'équipe de counter');
      return;
    }

    try {
      await createCounterTeam({
        name,
        monsters: counterMonsters,
        user_id: user!.id,
        defense_team_id: defenseTeamId,
        description
      });

      setCounterMonsters([]);
      loadDefenseTeams();
    } catch (error) {
      console.error('Erreur lors de la création du counter:', error);
      alert('Une erreur est survenue lors de la création du counter');
    }
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
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
        slug: teamName.toLowerCase().replace(/\s+/g, '-'),
        counters: []
      };
      
      const newCounterTeam: CounterTeam = {
        id: teamId,
        name: counterTeamName,
        monsters: counterMonsters,
        user_id: user.id,
        defense_team_id: teamId,
        created_at: new Date(),
        updated_at: new Date(),
        description: ''
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
      const matchingTeams = originalDefenseTeams.filter(team => 
        validSelectedMonsters.every(selected => 
          team.monsters.some(monster => monster.id === selected.id)
        )
      );
      setDefenseTeams(matchingTeams);
    } else {
      setDefenseTeams(originalDefenseTeams);
    }
    setSelectedMonsters([null, null, null]);
    setOpenSearchDialog(false);
  };

  const handleAddCounter = (team: DefenseTeam) => {
    if (!isMaintainer) {
      alert('Vous devez être maintainer pour ajouter un counter');
      return;
    }
    setSelectedDefenseTeam(team);
    setOpenCounterDialog(true);
  };

  const handleDefenseClick = (team: DefenseTeam) => {
    navigate(`/counter/${team.slug}`);
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

  const buttonStyle = {
    color: theme.palette.mode === 'dark' ? 'white' : undefined,
    borderColor: theme.palette.mode === 'dark' ? 'white' : undefined,
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'white' : undefined,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        {isMaintainer && (
          <Button 
            variant="outlined" 
            onClick={handleAddClick}
            sx={buttonStyle}
          >
            Ajouter une défense
          </Button>
        )}
        <Button 
          variant="outlined" 
          onClick={handleSearchClick}
          sx={buttonStyle}
        >
          Rechercher
        </Button>
        {defenseTeams !== originalDefenseTeams && (
          <Button 
            variant="outlined" 
            onClick={() => setDefenseTeams(originalDefenseTeams)}
            sx={buttonStyle}
          >
            Réinitialiser la recherche
          </Button>
        )}
      </Box>

      {/* Liste des équipes de défense */}
      {defenseTeams.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Aucune défense trouvée
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {defenseTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
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
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-start' }}>
                    {team.monsters.map((monster, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={getMonsterImagePath(monster.id)}
                        alt={monster.name}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDefenseClick(team);
                      }}
                      sx={{
                        width: '100%',
                        ...buttonStyle
                      }}
                    >
                      Voir les détails
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
      <Dialog open={openSearchDialog} onClose={() => setOpenSearchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rechercher une défense par monstres</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2">
              Sélectionnez jusqu'à 3 monstres pour trouver les défenses qui les contiennent tous
            </Typography>
            {[0, 1, 2].map((index) => (
              <Box key={index} sx={{ width: '100%' }}>
                {renderMonsterSelect(
                  index,
                  selectedMonsters[index],
                  handleMonsterSelect
                )}
              </Box>
            ))}
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={!selectedMonsters.some(m => m !== null)}
              sx={{ mt: 1 }}
            >
              Rechercher
            </Button>
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
            <Box sx={{ mb: 2, minHeight: 300, '& .tox-tinymce': { border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: 1 } }}>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                onInit={(evt, editor) => editorRef.current = editor}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  branding: false,
                  promotion: false,
                  language: 'fr_FR',
                  placeholder: 'Décrivez la stratégie de ce counter...'
                }}
              />
            </Box>
            <Button 
              variant="contained" 
              onClick={() => {
                if (selectedDefenseTeam && editorRef.current) {
                  const description = editorRef.current.getContent();
                  const counterTeamName = counterMonsters.map(m => m.name).join(' - ');
                  handleSaveCounterTeam(selectedDefenseTeam.id, counterTeamName, description);
                  setOpenCounterDialog(false);
                }
              }}
              disabled={counterMonsters.length !== 3 || counterMonsters.some(m => !m)}
              sx={{ mt: 2 }}
            >
              Sauvegarder l'équipe counter
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Counter; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  Autocomplete,
  TextField
} from '@mui/material';
import { Masonry } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import { DefenseTeam, CounterTeam, Monster } from '../types/Team';
import { getDefenseTeamBySlug, deleteDefenseTeam, deleteCounterTeam, createCounterTeam } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/config';
import { getMonsterImagePath } from '../data/monsterImages';
import { monsterData } from '../data/monsters';
import { Editor } from '@tinymce/tinymce-react';

interface UserData {
  unit_list: {
    unit_master_id: number;
  }[];
}

const DefensePage: React.FC = () => {
  const theme = useTheme();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isMaintainer } = useAuth();
  const [defenseTeam, setDefenseTeam] = useState<DefenseTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [counterToDelete, setCounterToDelete] = useState<string | null>(null);
  const [defenseDeleteConfirmOpen, setDefenseDeleteConfirmOpen] = useState(false);
  const [userMonsters, setUserMonsters] = useState<number[]>([]);
  const [openAddCounterDialog, setOpenAddCounterDialog] = useState(false);
  const [counterMonsters, setCounterMonsters] = useState<Monster[]>([]);
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    fetchDefenseTeam();
  }, [slug]);

  useEffect(() => {
    if (user?.id) {
      loadUserMonsters();
    }
  }, [user?.id]);

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

  const fetchDefenseTeam = async () => {
    if (!slug) {
      setError('Équipe non trouvée');
      return;
    }

    try {
      const team = await getDefenseTeamBySlug(slug);
      if (!team) {
        setError('Équipe non trouvée');
        return;
      }
      setDefenseTeam(team);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'équipe:', err);
      setError('Erreur lors de la récupération de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCounter = async () => {
    if (!counterToDelete) return;

    try {
      await deleteCounterTeam(counterToDelete);
      await fetchDefenseTeam();
      setCounterToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (err) {
      console.error('Erreur lors de la suppression du counter:', err);
      alert('Erreur lors de la suppression du counter');
    }
  };

  const handleDeleteDefense = async () => {
    if (!defenseTeam) return;

    try {
      await deleteDefenseTeam(defenseTeam.id);
      navigate('/counter');
    } catch (err) {
      console.error('Erreur lors de la suppression de la défense:', err);
      alert('Erreur lors de la suppression de la défense');
    }
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

  const handleCounterMonsterSelect = (monster: Monster | null, index: number) => {
    const newCounterMonsters = [...counterMonsters];
    if (monster) {
      newCounterMonsters[index] = monster;
    } else {
      newCounterMonsters.splice(index, 1);
    }
    setCounterMonsters(newCounterMonsters);
  };

  const handleSaveCounterTeam = async () => {
    if (counterMonsters.length !== 3 || counterMonsters.some(m => !m)) {
      alert('Veuillez sélectionner exactement 3 monstres pour l\'équipe counter');
      return;
    }

    try {
      const counterTeamName = counterMonsters.map(m => m.name).join(' - ');
      const description = editorRef.current ? editorRef.current.getContent() : '';

      await createCounterTeam({
        name: counterTeamName,
        monsters: counterMonsters,
        user_id: user!.id,
        defense_team_id: defenseTeam!.id,
        description
      });

      setCounterMonsters([]);
      setOpenAddCounterDialog(false);
      await fetchDefenseTeam();
    } catch (error) {
      console.error('Erreur lors de la création du counter:', error);
      alert('Une erreur est survenue lors de la création du counter');
    }
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
    mt: 2,
    color: theme.palette.mode === 'dark' ? 'white' : undefined,
    borderColor: theme.palette.mode === 'dark' ? 'white' : undefined,
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'white' : undefined,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography>Chargement...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !defenseTeam) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Défense
          </Typography>
          <Box sx={{ display: 'flex', gap: .25, alignItems: 'flex-start', flexDirection: 'column', width: 'fit-content' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {defenseTeam.monsters.map((monster, index) => (
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
            {isMaintainer && (
              <Button
                variant="outlined"
                onClick={() => setOpenAddCounterDialog(true)}
                sx={{ 
                  width: '100%',
                  ...buttonStyle 
                }}
              >
                Ajouter un counter
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {defenseTeam.name}
          </Typography>
          {isMaintainer && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDefenseDeleteConfirmOpen(true)}
              sx={theme.palette.mode === 'dark' ? {
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              } : undefined}
            >
              Supprimer la défense
            </Button>
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          Counters ({defenseTeam.counters.length})
        </Typography>
        <Box sx={{ 
          columnCount: {
            xs: 1,
            sm: 2
          },
          columnGap: 2,
          '& > *': {
            breakInside: 'avoid',
            marginBottom: 2,
            display: 'inline-block',
            width: '100%'
          }
        }}>
          {defenseTeam.counters
            .sort((a, b) => {
              const scoreA = calculateCounterScore(a);
              const scoreB = calculateCounterScore(b);
              return scoreB - scoreA;
            })
            .map((counter) => {
              const score = calculateCounterScore(counter);
              return (
                <Card key={counter.id} sx={{
                  opacity: score === 0 ? 0.6 : 1,
                  filter: score === 0 ? 'grayscale(50%)' : 'none',
                  bgcolor: score === 3 ? 'success.light' : undefined,
                  '&:hover': {
                    bgcolor: score === 3 ? 'success.light' : undefined
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {counter.monsters.map((monster, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={getMonsterImagePath(monster.id)}
                            alt={monster.name}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'contain',
                              borderRadius: '4px',
                              opacity: userMonsters.includes(monster.id) ? 1 : 0.5
                            }}
                          />
                        ))}
                      </Box>
                      {isMaintainer && (
                        <IconButton
                          color="error"
                          onClick={() => {
                            setCounterToDelete(counter.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    {counter.description && (
                      <Box 
                        sx={{ 
                          mt: 2,
                          '& img': { maxWidth: '100%', height: 'auto' },
                          '& p': { margin: 0 }
                        }}
                        dangerouslySetInnerHTML={{ __html: counter.description }}
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      color={score === 3 ? "success.main" : score === 0 ? "text.disabled" : "text.secondary"}
                      sx={{ mt: 2, fontWeight: score === 3 ? 'bold' : 'normal', color: score === 3 ? 'white' : 'inherit' }}
                    >
                      Monstres disponibles: {score}/3
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
        </Box>
      </Box>

      {/* Dialog de confirmation pour la suppression d'un counter */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce counter ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteCounter} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation pour la suppression de la défense */}
      <Dialog open={defenseDeleteConfirmOpen} onClose={() => setDefenseDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette défense et tous ses counters ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDefenseDeleteConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteDefense} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour ajouter un counter */}
      <Dialog open={openAddCounterDialog} onClose={() => setOpenAddCounterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un counter pour {defenseTeam?.name}</DialogTitle>
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
              onClick={handleSaveCounterTeam}
              disabled={counterMonsters.length !== 3 || counterMonsters.some(m => !m)}
              sx={{ mt: 2 }}
            >
              Sauvegarder l'équipe counter
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DefensePage; 
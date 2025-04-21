import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getUserBuilds, Build, createBuild, deleteBuild } from '../services/buildService';
import { getMonsterImagePath, monsterImages } from '../data/monsterImages';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { monsterData } from '../data/monsters';

interface BuildWithCounter extends Build {
  counter_teams: {
    id: string;
    name: string;
    monsters: { id: number; name: string }[];
    description: string;
    defense_team_id: string;
    defense_teams: {
      id: string;
      name: string;
      monsters: { id: number; name: string }[];
    };
  };
}

interface CreateBuildDialogProps {
  open: boolean;
  onClose: () => void;
  counterTeam: BuildWithCounter['counter_teams'];
  onSave: (builds: { monster1_build: string; monster2_build: string; monster3_build: string }) => void;
}

interface Monster {
  id: number;
  name: string;
}

const CreateBuildDialog: React.FC<CreateBuildDialogProps> = ({ open, onClose, counterTeam, onSave }) => {
  const [builds, setBuilds] = useState({
    monster1_build: '',
    monster2_build: '',
    monster3_build: ''
  });

  const handleSave = () => {
    onSave(builds);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Créer un build pour {counterTeam.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Description du counter :
          </Typography>
          <Box 
            sx={{ 
              mb: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              '& img': { maxWidth: '100%', height: 'auto' }
            }}
            dangerouslySetInnerHTML={{ __html: counterTeam.description }}
          />

          {counterTeam.monsters.map((monster, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
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
                <Typography variant="h6">{monster.name}</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={`Build pour ${monster.name}`}
                value={builds[`monster${index + 1}_build` as keyof typeof builds]}
                onChange={(e) => setBuilds(prev => ({
                  ...prev,
                  [`monster${index + 1}_build`]: e.target.value
                }))}
                sx={{ mt: 1 }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!builds.monster1_build && !builds.monster2_build && !builds.monster3_build}
        >
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BuildContent: React.FC<{ content: string; onImageClick: (index: number) => void }> = ({ content, onImageClick }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const imgElements = contentRef.current.getElementsByTagName('img');
      Array.from(imgElements).forEach((img, index) => {
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
          e.preventDefault();
          onImageClick(index);
        };
      });
    }
  }, [content, onImageClick]);

  return (
    <Box 
      ref={contentRef}
      sx={{ 
        mt: 2,
        '& img': { 
          maxWidth: '100%', 
          height: 'auto',
          margin: '8px 0',
          display: 'inline-block',
          verticalAlign: 'top',
          borderRadius: '4px',
          transition: 'transform 0.2s',
        },
        '& p': { margin: '8px 0' }
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const BuildCard: React.FC<{ build: BuildWithCounter; onDelete: () => void }> = ({ build, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    // Extraire les URLs des images du contenu HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = build.content || '';
    const imgElements = tempDiv.getElementsByTagName('img');
    const imgUrls = Array.from(imgElements).map(img => img.src);
    setImages(imgUrls);
  }, [build.content]);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {build.counter_teams.defense_teams.name}
            </Typography>
            <Button 
              color="error" 
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce build ?')) {
                  await deleteBuild(build.id);
                  onDelete();
                }
              }}
              size="small"
            >
              <DeleteIcon />
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {build.counter_teams.monsters.map((monster, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Box
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
                <Typography variant="caption" display="block">
                  {monster.name}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box 
              sx={{ 
                maxHeight: '300px',
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50px',
                }
              }}
            >
              <BuildContent 
                content={build.content || ''} 
                onImageClick={handleImageClick}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowFullContent(true)}
              >
                Lire plus
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          slides={images.map(src => ({ src }))}
          index={currentImageIndex}
        />
      )}

      <Dialog
        open={showFullContent}
        onClose={() => setShowFullContent(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {build.counter_teams.defense_teams.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {build.counter_teams.monsters.map((monster, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={getMonsterImagePath(monster.id)}
                    alt={monster.name}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    {monster.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <BuildContent 
            content={build.content || ''} 
            onImageClick={handleImageClick}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullContent(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BuildsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [builds, setBuilds] = useState<BuildWithCounter[]>([]);
  const [filteredBuilds, setFilteredBuilds] = useState<BuildWithCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<BuildWithCounter['counter_teams'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonsters, setSelectedMonsters] = useState<(Monster | null)[]>([null, null, null]);

  useEffect(() => {
    if (user) {
      loadBuilds();
    }
  }, [user]);

  useEffect(() => {
    filterBuilds();
  }, [selectedMonsters, builds]);

  useEffect(() => {
    // Vérifie si on arrive avec un counter sélectionné
    const state = location.state as { selectedCounter?: BuildWithCounter['counter_teams']; openCreateDialog?: boolean } | null;
    if (state?.selectedCounter && state?.openCreateDialog) {
      setSelectedCounter(state.selectedCounter);
      setCreateDialogOpen(true);
      // Nettoie l'état de navigation pour éviter de rouvrir la popup au refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadBuilds = async () => {
    try {
      const data = await getUserBuilds(user!.id);
      setBuilds(data as BuildWithCounter[]);
      setFilteredBuilds(data as BuildWithCounter[]);
    } catch (error) {
      console.error('Erreur lors du chargement des builds:', error);
      setError("Erreur lors du chargement des builds");
    } finally {
      setLoading(false);
    }
  };

  const filterBuilds = () => {
    if (!selectedMonsters[0]) {
      setFilteredBuilds(builds);
      return;
    }

    const filtered = builds.filter(build => {
      const defenseMonsters = build.counter_teams.defense_teams.monsters;
      
      // Vérifie si le premier monstre sélectionné est dans la défense
      const firstMonsterMatch = selectedMonsters[0] && 
        defenseMonsters.some(monster => monster.id === selectedMonsters[0]?.id);
      
      // Vérifie si le deuxième monstre sélectionné est dans la défense
      const secondMonsterMatch = selectedMonsters[1] && 
        defenseMonsters.some(monster => monster.id === selectedMonsters[1]?.id);
      
      // Vérifie si le troisième monstre sélectionné est dans la défense
      const thirdMonsterMatch = selectedMonsters[2] && 
        defenseMonsters.some(monster => monster.id === selectedMonsters[2]?.id);

      // Retourne true si le premier monstre est présent et que les autres monstres sélectionnés (s'ils existent) sont aussi présents
      return firstMonsterMatch && (!selectedMonsters[1] || secondMonsterMatch) && (!selectedMonsters[2] || thirdMonsterMatch);
    });

    setFilteredBuilds(filtered);
  };

  const handleSaveBuild = async (buildData: { monster1_build: string; monster2_build: string; monster3_build: string }) => {
    if (!selectedCounter || !user) return;

    try {
      const content = `${buildData.monster1_build}\n${buildData.monster2_build}\n${buildData.monster3_build}`;
      await createBuild(selectedCounter.id, content);
      await loadBuilds();
      setCreateDialogOpen(false);
      setSelectedCounter(null);
    } catch (error) {
      console.error('Erreur lors de la création du build:', error);
      setError("Erreur lors de la création du build");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Mes Builds</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {[0, 1, 2].map((index) => (
            <FormControl key={index} fullWidth>
              <InputLabel>Monstre {index + 1}</InputLabel>
              <Select
                value={selectedMonsters[index]?.id || ''}
                onChange={(e) => {
                  const newSelectedMonsters = [...selectedMonsters];
                  const monsterId = e.target.value as number;
                  newSelectedMonsters[index] = monsterId ? {
                    id: monsterId,
                    name: monsterData.names[monsterId]
                  } : null;
                  setSelectedMonsters(newSelectedMonsters);
                }}
                label={`Monstre ${index + 1}`}
              >
                <MenuItem value="">
                  <em>Aucun</em>
                </MenuItem>
                {Object.entries(monsterData.names)
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
                  )
                  .map((monster) => (
                    <MenuItem key={monster.id} value={monster.id}>
                      {monster.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {filteredBuilds.length === 0 ? (
        <Typography>
          {selectedMonsters[0] ? "Aucun build ne correspond à votre recherche." : "Vous n'avez pas encore de builds enregistrés."}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredBuilds.map((build) => (
            <Grid item xs={12} md={6} key={build.id}>
              <BuildCard 
                build={build} 
                onDelete={() => {
                  loadBuilds();
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {selectedCounter && (
        <CreateBuildDialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setSelectedCounter(null);
            setError(null);
          }}
          counterTeam={selectedCounter}
          onSave={handleSaveBuild}
        />
      )}
    </Container>
  );
};

export default BuildsPage; 
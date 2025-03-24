import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Chip,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { monsterData, getMonsterName } from '../data/monsters';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/config';

type AttributeId = 1 | 2 | 3 | 4 | 5;
type ArchetypeId = 0 | 1 | 2 | 3 | 4 | 5;

interface Monster {
  unit_id: number;
  unit_master_id: number;
  unit_level: number;
  class: ArchetypeId;
  unit_rarity: number;
  attribute: AttributeId;
  create_time: number;
  building_id: number;
  skills: {
    skill_id: number;
    level: number;
    cooltime: number;
  }[];
  runes: {
    slot_no: number;
    set_id: number;
    rank: number;
    class: number;
    level: number;
    pri_eff: [number, number];
    prefix_eff: [number, number];
    sec_eff: [number, number][];
  }[];
  artifacts: {
    artifact_id: number;
    attribute: number;
    level: number;
    sec_eff: [number, number][];
  }[];
  homunculus: {
    attribute: number;
    name: string;
  };
  homunculus_skills: {
    skill_id: number;
    level: number;
    cooltime: number;
  }[];
}

interface UserData {
  unit_list: Monster[];
}

const Bestiary = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<ArchetypeId | null>(null);
  const [userMonsters, setUserMonsters] = useState<UserData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchUserMonsters();
    }
  }, [user?.id]);

  const fetchUserMonsters = async () => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const jsonData = data?.data;
      if (jsonData && jsonData.unit_list) {
        setUserMonsters(jsonData);
      } else {
        setError('Format de données invalide');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des monstres:', err);
      setError('Erreur lors du chargement de vos monstres. Veuillez réessayer.');
    }
  };

  const filteredMonsters = userMonsters?.unit_list
    ? userMonsters.unit_list
        .filter((monster) => {
          const name = getMonsterName(monster.unit_master_id);
          const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesAttribute = !selectedAttribute || 
            monsterData.attributes[monster.attribute] === selectedAttribute;
          const matchesRarity = !selectedRarity || monster.unit_rarity === selectedRarity;
          const matchesClass = !selectedClass || monster.class === selectedClass;
          return matchesSearch && matchesAttribute && matchesRarity && matchesClass;
        })
        .sort((a, b) => b.unit_level - a.unit_level)
    : [];

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 1: return 'grey.500'; // 1★
      case 2: return 'green.500'; // 2★
      case 3: return 'blue.500'; // 3★
      case 4: return 'purple.500'; // 4★
      case 5: return 'orange.500'; // 5★
      case 6: return 'red.500'; // 6★
      default: return 'grey.500';
    }
  };

  const getClassLabel = (classId: ArchetypeId) => {
    return monsterData.archetypes[classId] || `Classe ${classId}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bestiaire
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!user ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Connectez-vous pour voir vos monstres
          </Alert>
        ) : !userMonsters ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Importez votre fichier JSON dans votre profil pour voir vos monstres
          </Alert>
        ) : (
          <>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un monstre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Attribut</InputLabel>
                <Select
                  value={selectedAttribute || ''}
                  label="Attribut"
                  onChange={(e) => setSelectedAttribute(e.target.value as string || null)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {Object.entries(monsterData.attributes).map(([id, name]) => (
                    <MenuItem key={id} value={name}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Rareté</InputLabel>
                <Select
                  value={selectedRarity || ''}
                  label="Rareté"
                  onChange={(e) => setSelectedRarity(e.target.value as number || null)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {[1, 2, 3, 4, 5, 6].map((rarity) => (
                    <MenuItem key={rarity} value={rarity}>{rarity}★</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Classe</InputLabel>
                <Select
                  value={selectedClass || ''}
                  label="Classe"
                  onChange={(e) => setSelectedClass(e.target.value as ArchetypeId || null)}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  {Object.entries(monsterData.archetypes).map(([id, name]) => (
                    <MenuItem key={id} value={Number(id)}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </>
        )}
      </Box>

      <Grid container spacing={3}>
        {filteredMonsters.map((monster) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={monster.unit_id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {getMonsterName(monster.unit_master_id)}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color={getRarityColor(monster.unit_rarity)}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {monster.unit_rarity}★
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={monsterData.attributes[monster.attribute]}
                    size="small"
                  />
                  <Chip
                    label={`Niveau ${monster.unit_level}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={getClassLabel(monster.class)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {monster.runes.length} runes équipées
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {monster.artifacts.length} artefacts équipés
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {monster.skills.length} compétences
                  </Typography>
                  {monster.homunculus && (
                    <Typography variant="body2" color="text.secondary">
                      Homunculus: {monster.homunculus.name}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Bestiary; 
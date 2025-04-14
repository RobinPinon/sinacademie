import { supabase } from '../config/supabase';
import { DefenseTeam, CounterTeam } from '../types/Team';

export const createDefenseTeam = async (team: Omit<DefenseTeam, 'id' | 'createdAt' | 'updatedAt' | 'counters'>): Promise<string> => {
  const { data, error } = await supabase
    .from('defense_teams')
    .insert({
      name: team.name,
      user_id: team.userId,
      monsters: team.monsters
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const createCounterTeam = async (team: Omit<CounterTeam, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const { data, error } = await supabase
    .from('counter_teams')
    .insert({
      name: team.name,
      user_id: team.userId,
      defense_team_id: team.defenseTeamId,
      monsters: team.monsters
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getDefenseTeams = async (): Promise<DefenseTeam[]> => {
  const { data, error } = await supabase
    .from('defense_teams')
    .select(`
      *,
      counter_teams (*)
    `);

  if (error) throw error;

  return data.map(team => ({
    id: team.id,
    name: team.name,
    monsters: team.monsters,
    userId: team.user_id,
    createdAt: new Date(team.created_at),
    updatedAt: new Date(team.updated_at),
    counters: team.counter_teams?.map(counter => ({
      id: counter.id,
      name: counter.name,
      monsters: counter.monsters,
      userId: counter.user_id,
      defenseTeamId: counter.defense_team_id,
      createdAt: new Date(counter.created_at),
      updatedAt: new Date(counter.updated_at)
    })) || []
  }));
};

export const getDefenseTeam = async (id: string): Promise<DefenseTeam | null> => {
  const { data, error } = await supabase
    .from('defense_teams')
    .select(`
      *,
      counter_teams (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    monsters: data.monsters,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    counters: data.counter_teams?.map(counter => ({
      id: counter.id,
      name: counter.name,
      monsters: counter.monsters,
      userId: counter.user_id,
      defenseTeamId: counter.defense_team_id,
      createdAt: new Date(counter.created_at),
      updatedAt: new Date(counter.updated_at)
    })) || []
  };
};

export const getCounterTeamsForDefense = async (defenseTeamId: string): Promise<CounterTeam[]> => {
  const { data, error } = await supabase
    .from('counter_teams')
    .select('*')
    .eq('defense_team_id', defenseTeamId);

  if (error) throw error;

  return data.map(counter => ({
    id: counter.id,
    name: counter.name,
    monsters: counter.monsters,
    userId: counter.user_id,
    defenseTeamId: counter.defense_team_id,
    createdAt: new Date(counter.created_at),
    updatedAt: new Date(counter.updated_at)
  }));
}; 
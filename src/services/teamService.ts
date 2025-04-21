import { supabase } from '../supabase/config';
import { DefenseTeam, CounterTeam, Monster } from '../types/Team';

interface CreateDefenseTeamParams {
  name: string;
  monsters: Monster[];
  user_id: string;
  slug: string;
}

interface CreateCounterTeamParams {
  name: string;
  monsters: Monster[];
  user_id: string;
  defense_team_id: string;
  description: string;
}

export const createDefenseTeam = async (params: CreateDefenseTeamParams) => {
  const { data, error } = await supabase
    .from('defense_teams')
    .insert({
      name: params.name,
      monsters: params.monsters,
      user_id: params.user_id,
      slug: params.slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createCounterTeam = async (params: CreateCounterTeamParams) => {
  const { data, error } = await supabase
    .from('counter_teams')
    .insert({
      name: params.name,
      monsters: params.monsters,
      user_id: params.user_id,
      defense_team_id: params.defense_team_id,
      description: params.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDefenseTeams = async () => {
  const { data, error } = await supabase
    .from('defense_teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
    user_id: data.user_id,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    slug: data.slug,
    counters: data.counter_teams?.map(counter => ({
      id: counter.id,
      name: counter.name,
      monsters: counter.monsters,
      user_id: counter.user_id,
      defense_team_id: counter.defense_team_id,
      created_at: new Date(counter.created_at),
      updated_at: new Date(counter.updated_at),
      description: counter.description || ''
    })) || []
  };
};

export const getCounterTeamsForDefense = async (defenseTeamId: string) => {
  const { data, error } = await supabase
    .from('counter_teams')
    .select('*')
    .eq('defense_team_id', defenseTeamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getDefenseTeamBySlug = async (slug: string): Promise<DefenseTeam | null> => {
  const { data, error } = await supabase
    .from('defense_teams')
    .select(`
      *,
      counter_teams (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    monsters: data.monsters,
    user_id: data.user_id,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    slug: data.slug,
    counters: data.counter_teams?.map(counter => ({
      id: counter.id,
      name: counter.name,
      monsters: counter.monsters,
      user_id: counter.user_id,
      defense_team_id: counter.defense_team_id,
      created_at: new Date(counter.created_at),
      updated_at: new Date(counter.updated_at),
      description: counter.description || ''
    })) || []
  };
};

export const deleteDefenseTeam = async (teamId: string) => {
  const { error } = await supabase
    .from('defense_teams')
    .delete()
    .eq('id', teamId);

  if (error) throw error;
};

export const deleteCounterTeam = async (counterId: string) => {
  const { error } = await supabase
    .from('counter_teams')
    .delete()
    .eq('id', counterId);

  if (error) throw error;
}; 
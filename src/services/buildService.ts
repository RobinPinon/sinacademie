import { supabase } from '../supabase/config';
import { monsterData } from '../data/monsters';

export interface Build {
  id: number;
  user_id: string;
  counter_team_id: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  counter_teams?: {
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

export const createBuild = async (
  counter_team_id: string,
  content: string = ''
): Promise<Build | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found');
    return null;
  }

  const { data, error } = await supabase
    .from('builds')
    .insert({
      user_id: user.id,
      counter_team_id,
      content
    })
    .select('*, counter_teams(*)')
    .single();

  if (error) {
    console.error('Error creating build:', error);
    return null;
  }

  return data;
};

export const getBuildForCounter = async (counter_team_id: string): Promise<Build | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found');
    return null;
  }

  const { data, error } = await supabase
    .from('builds')
    .select(`
      *,
      counter_teams (
        id,
        name,
        monsters,
        description,
        defense_team_id,
        defense_teams (
          id,
          name,
          monsters
        )
      )
    `)
    .eq('counter_team_id', counter_team_id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error getting build:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    counter_teams: data.counter_teams ? {
      ...data.counter_teams,
      monsters: data.counter_teams.monsters.map((id: string | number) => {
        const monsterId = id.toString();
        return {
          id: parseInt(monsterId),
          name: monsterData.names[parseInt(monsterId)] || 'Monstre inconnu'
        };
      }),
      defense_teams: {
        ...data.counter_teams.defense_teams,
        monsters: data.counter_teams.defense_teams.monsters.map((id: string | number) => {
          const monsterId = id.toString();
          return {
            id: parseInt(monsterId),
            name: monsterData.names[parseInt(monsterId)] || 'Monstre inconnu'
          };
        })
      }
    } : null
  };
};

export const getUserBuilds = async (userId: string): Promise<Build[]> => {
  const { data, error } = await supabase
    .from('builds')
    .select(`
      *,
      counter_teams (
        id,
        name,
        monsters,
        description,
        defense_team_id,
        defense_teams (
          id,
          name,
          monsters
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting user builds:', error);
    return [];
  }

  if (!data) return [];

  return data.map(build => ({
    ...build,
    counter_teams: build.counter_teams ? {
      ...build.counter_teams,
      monsters: build.counter_teams.monsters.map((id: string | number) => {
        const monsterId = id.toString();
        return {
          id: parseInt(monsterId),
          name: monsterData.names[parseInt(monsterId)] || 'Monstre inconnu'
        };
      }),
      defense_teams: {
        ...build.counter_teams.defense_teams,
        monsters: build.counter_teams.defense_teams.monsters.map((id: string | number) => {
          const monsterId = id.toString();
          return {
            id: parseInt(monsterId),
            name: monsterData.names[parseInt(monsterId)] || 'Monstre inconnu'
          };
        })
      }
    } : null
  }));
};

export const getAllBuildsForUser = async (): Promise<Build[]> => {
  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting builds:', error);
    return [];
  }

  return data || [];
};

export const updateBuild = async (
  build_id: number,
  updates: Partial<Omit<Build, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Build | null> => {
  const { data, error } = await supabase
    .from('builds')
    .update(updates)
    .eq('id', build_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating build:', error);
    return null;
  }

  return data;
};

export const deleteBuild = async (build_id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('builds')
    .delete()
    .eq('id', build_id);

  if (error) {
    console.error('Error deleting build:', error);
    return false;
  }

  return true;
}; 
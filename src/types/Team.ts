export interface Monster {
  id: number;
  name: string;
}

export interface BaseTeam {
  id: string;
  name: string;
  monsters: Monster[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface DefenseTeam {
  id: string;
  name: string;
  monsters: Monster[];
  user_id: string;
  created_at: Date;
  updated_at: Date;
  counters: CounterTeam[];
  slug: string;
}

export interface CounterTeam {
  id: string;
  name: string;
  monsters: Monster[];
  user_id: string;
  defense_team_id: string;
  created_at: Date;
  updated_at: Date;
  description: string;
}

export interface UserData {
  id: string;
  user_id: string;
  data: any;
  updated_at: Date;
  data_hash: string;
  file_name: string;
}

export interface User {
  id: string;
  email: string;
  is_approved: boolean;
  created_at: Date;
  is_admin: boolean;
  is_maintainer: boolean;
} 
export interface Monster {
  id: number;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  monsters: Monster[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefenseTeam extends Team {
  counters: CounterTeam[];
}

export interface CounterTeam extends Team {
  defenseTeamId: string;
} 
export interface AiTeam {
  id: string;
  name: string;
  strength: number; // 0-100
}

export interface League {
  id: string;
  name: string;
  level: number; // 1-6
  teams: AiTeam[];
}

export interface TableEntry {
  teamId: string;
  teamName: string;
  isPlayer: boolean;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Fixture {
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  result?: {
    homeGoals: number;
    awayGoals: number;
  };
}

export interface PlayerState {
  teamName: string;
  strength: number; // Starts at a base level and improves
  currentLeagueId: string;
  trainingPoints: number; // Earned from habits, resets daily
  perfectWeekBonus: boolean; // For the +20% "Estadio Lleno" bonus
  morale: number; // 0-100, affects match performance
  seasonHistory: {
    [season: number]: {
      leagueId: string;
      finalPosition: number;
    };
  };
}

export interface GameState {
  player: PlayerState;
  leagues: League[];
  currentSeason: number;
  currentMatchday: number;
  fixtures: Fixture[];
  table: TableEntry[];
  gameWon: boolean; // Flag for after winning the Premier League
}

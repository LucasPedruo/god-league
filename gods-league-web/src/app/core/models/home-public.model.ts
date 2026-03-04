export type MvpCategoryId = 'artilheiro' | 'assistente' | 'defesas' | 'cartoes' | 'drible';

export interface TeamItem {
  id: string;
  name: string;
  shieldUrl: string;
}

export interface MatchItem {
  id: string;
  round: number;
  date: string;
  time: string;
  homeTeam: TeamItem;
  awayTeam: TeamItem;
}

export interface PlayerStatItem {
  playerName: string;
  teamName: string;
  value: number;
}

export interface StatsCategory {
  id: MvpCategoryId;
  title: string;
  unit: string;
  top3: PlayerStatItem[];
}

export interface HomePublicData {
  teams: TeamItem[];
  matches: MatchItem[];
  mvpSummary: StatsCategory[];
}

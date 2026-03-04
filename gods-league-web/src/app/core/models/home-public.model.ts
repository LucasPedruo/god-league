export type MvpCategoryId = 'artilheiro' | 'assistente' | 'defesas' | 'cartoes' | 'drible';
export type AdvancedCategoryId =
  | 'gols'
  | 'chute_a_gol'
  | 'defesas'
  | 'goleiro'
  | 'cartoes'
  | 'mvp_jogo'
  | 'mvp_rodada';

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
  playerId?: string;
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

export interface ClassificationRow {
  teamId: string;
  teamName: string;
  shieldUrl: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export interface AdvancedStatCategory {
  id: AdvancedCategoryId;
  title: string;
  unit: string;
}

export interface AdvancedStatRow {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
}

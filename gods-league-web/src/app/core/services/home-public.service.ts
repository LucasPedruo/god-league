import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  AdvancedCategoryId,
  AdvancedStatCategory,
  AdvancedStatRow,
  ClassificationRow,
  HomePublicData,
  MatchItem,
  MvpCategoryId,
  PlayerStatItem,
  StatsCategory,
  TeamItem,
} from '../models/home-public.model';
import { environment } from '../../../environments/environment';

interface FirestoreTeam {
  name?: string;
  shieldUrl?: string;
  seasonId?: string;
  active?: boolean;
}

interface FirestoreMatch {
  seasonId?: string;
  round?: number;
  date?: Timestamp | string;
  time?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeGoals?: number;
  awayGoals?: number;
}

interface FirestoreMvpEntry {
  playerId?: string;
  value?: number;
}

interface FirestoreMvpDoc {
  seasonId?: string;
  category?: MvpCategoryId;
  rankings?: FirestoreMvpEntry[];
}

interface FirestorePlayer {
  name?: string;
  teamId?: string;
  status?: string;
  goals?: number;
  gols?: number;
  chuteAGol?: number;
  chute_a_gol?: number;
  defesas?: number;
  goleiro?: number;
  cartoes?: number;
  mvpJogo?: number;
  mvp_jogo?: number;
  mvpRodada?: number;
  mvp_rodada?: number;
  stats?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class HomePublicService {
  private firestore: Firestore | null = null;

  async getHomeData(): Promise<HomePublicData> {
    const db = this.getFirestore();
    const activeSeasonId = await this.getActiveSeasonId(db);
    const teams = await this.getTeams(db, activeSeasonId);
    const matches = await this.getMatches(db, activeSeasonId, teams);
    const mvpSummary = await this.getMvpSummary(db, activeSeasonId, teams);
    return { teams, matches, mvpSummary };
  }

  async getTeamsList(): Promise<TeamItem[]> {
    const db = this.getFirestore();
    const activeSeasonId = await this.getActiveSeasonId(db);
    return this.getTeams(db, activeSeasonId);
  }

  async getClassification(): Promise<ClassificationRow[]> {
    const db = this.getFirestore();
    const activeSeasonId = await this.getActiveSeasonId(db);
    const teams = await this.getTeams(db, activeSeasonId);
    const matches = await this.getMatches(db, activeSeasonId, teams, true);

    const rowsByTeamId = new Map<string, ClassificationRow>(
      teams.map((team) => [
        team.id,
        {
          teamId: team.id,
          teamName: team.name,
          shieldUrl: team.shieldUrl,
          pontos: 0,
          jogos: 0,
          vitorias: 0,
          empates: 0,
          derrotas: 0,
          golsPro: 0,
          golsContra: 0,
          saldoGols: 0,
        },
      ]),
    );

    for (const match of matches) {
      const withScore = match as MatchItem & { homeGoals?: number; awayGoals?: number };
      if (!Number.isFinite(withScore.homeGoals) || !Number.isFinite(withScore.awayGoals)) {
        continue;
      }

      const home = rowsByTeamId.get(match.homeTeam.id);
      const away = rowsByTeamId.get(match.awayTeam.id);
      if (!home || !away) {
        continue;
      }

      const homeGoals = Number(withScore.homeGoals);
      const awayGoals = Number(withScore.awayGoals);

      home.jogos += 1;
      away.jogos += 1;

      home.golsPro += homeGoals;
      home.golsContra += awayGoals;
      away.golsPro += awayGoals;
      away.golsContra += homeGoals;

      if (homeGoals > awayGoals) {
        home.vitorias += 1;
        away.derrotas += 1;
        home.pontos += 3;
      } else if (awayGoals > homeGoals) {
        away.vitorias += 1;
        home.derrotas += 1;
        away.pontos += 3;
      } else {
        home.empates += 1;
        away.empates += 1;
        home.pontos += 1;
        away.pontos += 1;
      }
    }

    const rows = [...rowsByTeamId.values()].map((row) => ({
      ...row,
      saldoGols: row.golsPro - row.golsContra,
    }));

    return rows.sort((a, b) => {
      if (b.pontos !== a.pontos) {
        return b.pontos - a.pontos;
      }
      if (b.vitorias !== a.vitorias) {
        return b.vitorias - a.vitorias;
      }
      if (b.saldoGols !== a.saldoGols) {
        return b.saldoGols - a.saldoGols;
      }
      if (b.golsPro !== a.golsPro) {
        return b.golsPro - a.golsPro;
      }
      return a.teamName.localeCompare(b.teamName);
    });
  }

  getAdvancedCategories(): AdvancedStatCategory[] {
    return [
      { id: 'gols', title: 'Gols', unit: 'gols' },
      { id: 'chute_a_gol', title: 'Chute a Gol', unit: 'finalizacoes' },
      { id: 'defesas', title: 'Defesas', unit: 'defesas' },
      { id: 'goleiro', title: 'Goleiro', unit: 'pontos' },
      { id: 'cartoes', title: 'Cartoes', unit: 'cartoes' },
      { id: 'mvp_jogo', title: 'MVP Jogo', unit: 'votos' },
      { id: 'mvp_rodada', title: 'MVP Rodada', unit: 'votos' },
    ];
  }

  async getDetailedStats(categoryId: AdvancedCategoryId): Promise<AdvancedStatRow[]> {
    const db = this.getFirestore();
    const activeSeasonId = await this.getActiveSeasonId(db);
    const teams = await this.getTeams(db, activeSeasonId);
    const teamsById = new Map(teams.map((team) => [team.id, team]));

    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);

    const rows: AdvancedStatRow[] = [];
    for (const item of snapshot.docs) {
      const player = item.data() as FirestorePlayer;
      const playerName = this.normalizeString(player.name);
      const teamId = this.normalizeString(player.teamId);
      if (!playerName || !teamId) {
        continue;
      }

      const team = teamsById.get(teamId);
      if (!team) {
        continue;
      }

      const status = this.normalizeString(player.status);
      const isValid = !status || status === 'validado' || status === 'validated';
      if (!isValid) {
        continue;
      }

      const value = this.resolveAdvancedStatValue(player, categoryId);
      rows.push({
        playerId: item.id,
        playerName,
        teamId: team.id,
        teamName: team.name,
        value,
      });
    }

    return rows.sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      return a.playerName.localeCompare(b.playerName);
    });
  }

  private getFirestore(): Firestore {
    if (this.firestore) {
      return this.firestore;
    }

    const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    this.firestore = getFirestore(app);
    return this.firestore;
  }

  private async getActiveSeasonId(db: Firestore): Promise<string | null> {
    const seasonsRef = collection(db, 'seasons');
    const seasonsQuery = query(seasonsRef, where('active', '==', true), limit(1));
    const snapshot = await getDocs(seasonsQuery);
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].id;
  }

  private async getTeams(db: Firestore, seasonId: string | null): Promise<TeamItem[]> {
    const teamsRef = collection(db, 'teams');
    const snapshot = await getDocs(teamsRef);

    return snapshot.docs
      .map((item) => ({ id: item.id, ...(item.data() as FirestoreTeam) }))
      .filter((team) => {
        const validName = typeof team.name === 'string' && team.name.trim().length > 0;
        const inSeason = !seasonId || team.seasonId === seasonId;
        const isActive = team.active !== false;
        return validName && inSeason && isActive;
      })
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      .map((team) => ({
        id: team.id,
        name: team.name!.trim(),
        shieldUrl: this.normalizeShieldUrl(team.shieldUrl),
      }));
  }

  private async getMatches(
    db: Firestore,
    seasonId: string | null,
    teams: TeamItem[],
    includeGoals = false,
  ): Promise<MatchItem[]> {
    const teamsById = new Map(teams.map((team) => [team.id, team]));
    const matchesRef = collection(db, 'matches');
    const snapshot = await getDocs(matchesRef);

    const rows = snapshot.docs
      .map((item) => ({ id: item.id, ...(item.data() as FirestoreMatch) }))
      .filter((match) => {
        const inSeason = !seasonId || match.seasonId === seasonId;
        return inSeason && !!match.homeTeamId && !!match.awayTeamId;
      })
      .map((match) => {
        const homeTeam = teamsById.get(match.homeTeamId!);
        const awayTeam = teamsById.get(match.awayTeamId!);
        if (!homeTeam || !awayTeam) {
          return null;
        }

        const base: MatchItem & { homeGoals?: number; awayGoals?: number; sortableDate: number } = {
          id: match.id,
          round: Number.isFinite(match.round) ? Number(match.round) : 0,
          date: this.formatDate(match.date),
          time: typeof match.time === 'string' && match.time.trim().length > 0 ? match.time.trim() : '--:--',
          homeTeam,
          awayTeam,
          sortableDate: this.getSortableDate(match.date),
        };

        if (includeGoals) {
          if (typeof match.homeGoals === 'number') {
            base.homeGoals = match.homeGoals;
          }
          if (typeof match.awayGoals === 'number') {
            base.awayGoals = match.awayGoals;
          }
        }

        return base;
      })
      .filter((match): match is MatchItem & { homeGoals?: number; awayGoals?: number; sortableDate: number } => !!match);

    return rows
      .sort((a, b) => {
        if (a.round !== b.round) {
          return a.round - b.round;
        }
        return a.sortableDate - b.sortableDate;
      })
      .map(({ sortableDate: _, ...match }) => match);
  }

  private async getMvpSummary(db: Firestore, seasonId: string | null, teams: TeamItem[]): Promise<StatsCategory[]> {
    const categories = this.getDefaultMvpCategories();
    const categoriesById = new Map(categories.map((item) => [item.id, item]));
    const teamsById = new Map(teams.map((team) => [team.id, team]));

    const mvpRef = collection(db, 'mvp_summary');
    const snapshot = await getDocs(mvpRef);
    const docs = snapshot.docs
      .map((item) => ({ id: item.id, ...(item.data() as FirestoreMvpDoc) }))
      .filter((item) => !seasonId || item.seasonId === seasonId);

    for (const item of docs) {
      const categoryId = item.category;
      if (!categoryId || !categoriesById.has(categoryId)) {
        continue;
      }

      const lines = await this.mapRankingEntries(db, item.rankings ?? [], teamsById);
      categoriesById.get(categoryId)!.top3 = lines.slice(0, 3);
    }

    return categories;
  }

  private async mapRankingEntries(
    db: Firestore,
    entries: FirestoreMvpEntry[],
    teamsById: Map<string, TeamItem>,
  ): Promise<PlayerStatItem[]> {
    const result: PlayerStatItem[] = [];

    for (const entry of entries) {
      if (!entry.playerId || typeof entry.value !== 'number') {
        continue;
      }

      const playerRef = doc(db, 'players', entry.playerId);
      const playerSnap = await getDoc(playerRef);
      if (!playerSnap.exists()) {
        continue;
      }

      const player = playerSnap.data() as FirestorePlayer;
      const playerName = this.normalizeString(player.name);
      const teamId = this.normalizeString(player.teamId);
      const team = teamId ? teamsById.get(teamId) : undefined;
      const status = this.normalizeString(player.status);
      const isValid = !status || status === 'validado' || status === 'validated';

      if (!playerName || !team || !isValid) {
        continue;
      }

      result.push({
        playerId: entry.playerId,
        playerName,
        teamName: team.name,
        value: entry.value,
      });
    }

    return result.sort((a, b) => b.value - a.value);
  }

  private getDefaultMvpCategories(): StatsCategory[] {
    return [
      { id: 'artilheiro', title: 'Artilheiro', unit: 'gols', top3: [] },
      { id: 'assistente', title: 'Assistente', unit: 'assistencias', top3: [] },
      { id: 'defesas', title: 'Defesas', unit: 'defesas', top3: [] },
      { id: 'cartoes', title: 'Cartoes', unit: 'cartoes', top3: [] },
      { id: 'drible', title: 'Drible', unit: 'dribles', top3: [] },
    ];
  }

  private resolveAdvancedStatValue(player: FirestorePlayer, categoryId: AdvancedCategoryId): number {
    const stats = player.stats ?? {};

    switch (categoryId) {
      case 'gols':
        return this.firstNumber(player.gols, player.goals, stats['gols'], stats['goals']);
      case 'chute_a_gol':
        return this.firstNumber(player.chute_a_gol, player.chuteAGol, stats['chute_a_gol'], stats['chuteAGol']);
      case 'defesas':
        return this.firstNumber(player.defesas, stats['defesas']);
      case 'goleiro':
        return this.firstNumber(player.goleiro, stats['goleiro']);
      case 'cartoes':
        return this.firstNumber(player.cartoes, stats['cartoes']);
      case 'mvp_jogo':
        return this.firstNumber(player.mvp_jogo, player.mvpJogo, stats['mvp_jogo'], stats['mvpJogo']);
      case 'mvp_rodada':
        return this.firstNumber(player.mvp_rodada, player.mvpRodada, stats['mvp_rodada'], stats['mvpRodada']);
      default:
        return 0;
    }
  }

  private firstNumber(...values: unknown[]): number {
    for (const value of values) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
    }
    return 0;
  }

  private getSortableDate(value: Timestamp | string | undefined): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    if (value instanceof Timestamp) {
      return value.toMillis();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }
    return parsed.getTime();
  }

  private formatDate(value: Timestamp | string | undefined): string {
    if (!value) {
      return '--/--/----';
    }

    if (value instanceof Timestamp) {
      return value.toDate().toLocaleDateString('pt-BR');
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '--/--/----';
    }
    return parsed.toLocaleDateString('pt-BR');
  }

  private normalizeShieldUrl(shieldUrl: string | undefined): string {
    if (typeof shieldUrl === 'string' && shieldUrl.trim().length > 0) {
      return shieldUrl;
    }
    return 'https://placehold.co/64x64/17231e/45d483?text=GL';
  }

  private normalizeString(value: string | undefined): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }
}

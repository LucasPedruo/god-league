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

interface FirestoreSeason {
  active?: boolean;
}

interface FirestoreMatch {
  seasonId?: string;
  round?: number;
  date?: Timestamp | string;
  time?: string;
  homeTeamId?: string;
  awayTeamId?: string;
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

  private async getMatches(db: Firestore, seasonId: string | null, teams: TeamItem[]): Promise<MatchItem[]> {
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

        return {
          id: match.id,
          round: Number.isFinite(match.round) ? Number(match.round) : 0,
          date: this.formatDate(match.date),
          time: typeof match.time === 'string' && match.time.trim().length > 0 ? match.time.trim() : '--:--',
          homeTeam,
          awayTeam,
        } satisfies MatchItem;
      })
      .filter((match): match is MatchItem => !!match);

    return rows.sort((a, b) => {
      if (a.round !== b.round) {
        return a.round - b.round;
      }
      return a.date.localeCompare(b.date);
    });
  }

  private async getMvpSummary(db: Firestore, seasonId: string | null, teams: TeamItem[]): Promise<StatsCategory[]> {
    const categories = this.getDefaultCategories();
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
      const playerName = typeof player.name === 'string' ? player.name.trim() : '';
      const team = player.teamId ? teamsById.get(player.teamId) : undefined;
      const isValid = player.status === 'validado' || player.status === 'validated' || player.status === undefined;

      if (!playerName || !team || !isValid) {
        continue;
      }

      result.push({
        playerName,
        teamName: team.name,
        value: entry.value,
      });
    }

    return result.sort((a, b) => b.value - a.value);
  }

  private getDefaultCategories(): StatsCategory[] {
    return [
      { id: 'artilheiro', title: 'Artilheiro', unit: 'gols', top3: [] },
      { id: 'assistente', title: 'Assistente', unit: 'assistencias', top3: [] },
      { id: 'defesas', title: 'Defesas', unit: 'defesas', top3: [] },
      { id: 'cartoes', title: 'Cartoes', unit: 'cartoes', top3: [] },
      { id: 'drible', title: 'Drible', unit: 'dribles', top3: [] },
    ];
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
}

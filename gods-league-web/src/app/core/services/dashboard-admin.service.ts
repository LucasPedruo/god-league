import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { AdvancedCategoryId, MvpCategoryId } from '../models/home-public.model';

export interface AdminUserItem {
  uid: string;
  nome: string;
  email: string;
  tipo: 'MASTER' | 'ADMIN';
  ativo: boolean;
  imagemPerfil?: string;
}

export interface SeasonItem {
  id: string;
  name: string;
  year: number;
  active: boolean;
}

export interface TeamItemAdmin {
  id: string;
  name: string;
  shieldUrl: string;
  seasonId: string;
  active: boolean;
}

export interface PlayerItemAdmin {
  id: string;
  name: string;
  teamId: string;
  status: string;
}

export interface MatchItemAdmin {
  id: string;
  seasonId: string;
  round: number;
  date: string;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals?: number;
  awayGoals?: number;
}

export interface MatchPlayerStatInput {
  playerId: string;
  gols: number;
  chute_a_gol: number;
  defesas: number;
  goleiro: number;
  cartoes: number;
  mvp_jogo: number;
  mvp_rodada: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardAdminService {
  private firestore: Firestore | null = null;

  async listAdminUsers(): Promise<AdminUserItem[]> {
    const db = this.getFirestore();
    const snapshot = await getDocs(collection(db, 'admin_users'));
    return snapshot.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .map(({ id, data }) => {
        const tipo: 'MASTER' | 'ADMIN' = data['tipo'] === 'MASTER' ? 'MASTER' : 'ADMIN';
        return {
          uid: id,
          nome: typeof data['nome'] === 'string' ? data['nome'] : '',
          email: typeof data['email'] === 'string' ? data['email'] : '',
          tipo,
          ativo: data['ativo'] !== false,
          imagemPerfil: typeof data['imagemPerfil'] === 'string' ? data['imagemPerfil'] : '',
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async createAdminUser(payload: {
    uid: string;
    nome: string;
    email: string;
    tipo: 'MASTER' | 'ADMIN';
    ativo: boolean;
    senha?: string;
  }): Promise<void> {
    const db = this.getFirestore();
    const ref = doc(db, 'admin_users', payload.uid);
    await setDoc(
      ref,
      {
        nome: payload.nome,
        email: payload.email,
        tipo: payload.tipo,
        ativo: payload.ativo,
        senha: payload.senha ?? '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async updateOwnAdminUserProfile(payload: { uid: string; nome: string; imagemPerfil: string }): Promise<void> {
    const db = this.getFirestore();
    const ref = doc(db, 'admin_users', payload.uid);
    await setDoc(
      ref,
      {
        nome: payload.nome,
        imagemPerfil: payload.imagemPerfil,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async listSeasons(): Promise<SeasonItem[]> {
    const db = this.getFirestore();
    const snapshot = await getDocs(collection(db, 'seasons'));
    return snapshot.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .map(({ id, data }) => ({
        id,
        name: typeof data['name'] === 'string' ? data['name'] : 'Temporada',
        year: typeof data['year'] === 'number' ? data['year'] : 0,
        active: data['active'] === true,
      }))
      .sort((a, b) => b.year - a.year);
  }

  async createSeason(payload: { id: string; name: string; year: number; active: boolean }): Promise<void> {
    const db = this.getFirestore();
    const ref = doc(db, 'seasons', payload.id);
    await setDoc(
      ref,
      {
        name: payload.name,
        year: payload.year,
        active: payload.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    if (payload.active) {
      await this.setOnlyOneSeasonActive(payload.id);
    }
  }

  async setSeasonActive(seasonId: string): Promise<void> {
    await this.setOnlyOneSeasonActive(seasonId);
  }

  async listTeams(): Promise<TeamItemAdmin[]> {
    const db = this.getFirestore();
    const snapshot = await getDocs(collection(db, 'teams'));
    return snapshot.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .map(({ id, data }) => ({
        id,
        name: typeof data['name'] === 'string' ? data['name'] : '',
        shieldUrl: typeof data['shieldUrl'] === 'string' ? data['shieldUrl'] : '',
        seasonId: typeof data['seasonId'] === 'string' ? data['seasonId'] : '',
        active: data['active'] !== false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createTeam(payload: {
    id: string;
    name: string;
    shieldUrl: string;
    seasonId: string;
    active: boolean;
  }): Promise<void> {
    const db = this.getFirestore();
    await setDoc(
      doc(db, 'teams', payload.id),
      {
        name: payload.name,
        shieldUrl: payload.shieldUrl,
        seasonId: payload.seasonId,
        active: payload.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async deleteTeam(teamId: string): Promise<void> {
    const db = this.getFirestore();
    await deleteDoc(doc(db, 'teams', teamId));
  }

  async listPlayers(): Promise<PlayerItemAdmin[]> {
    const db = this.getFirestore();
    const snapshot = await getDocs(collection(db, 'players'));
    return snapshot.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .map(({ id, data }) => ({
        id,
        name: typeof data['name'] === 'string' ? data['name'] : '',
        teamId: typeof data['teamId'] === 'string' ? data['teamId'] : '',
        status: typeof data['status'] === 'string' ? data['status'] : 'validado',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createOrUpdatePlayer(payload: { id: string; name: string; teamId: string; status: string }): Promise<void> {
    const db = this.getFirestore();
    await setDoc(
      doc(db, 'players', payload.id),
      {
        name: payload.name,
        teamId: payload.teamId,
        status: payload.status,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async deletePlayer(playerId: string): Promise<void> {
    const db = this.getFirestore();
    await deleteDoc(doc(db, 'players', playerId));
  }

  async listMatches(): Promise<MatchItemAdmin[]> {
    const db = this.getFirestore();
    const snapshot = await getDocs(collection(db, 'matches'));
    return snapshot.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .map(({ id, data }) => ({
        id,
        seasonId: typeof data['seasonId'] === 'string' ? data['seasonId'] : '',
        round: typeof data['round'] === 'number' ? data['round'] : 0,
        date: this.asDateInputValue(data['date']),
        time: typeof data['time'] === 'string' ? data['time'] : '',
        homeTeamId: typeof data['homeTeamId'] === 'string' ? data['homeTeamId'] : '',
        awayTeamId: typeof data['awayTeamId'] === 'string' ? data['awayTeamId'] : '',
        homeGoals: typeof data['homeGoals'] === 'number' ? data['homeGoals'] : undefined,
        awayGoals: typeof data['awayGoals'] === 'number' ? data['awayGoals'] : undefined,
      }))
      .sort((a, b) => (a.round !== b.round ? a.round - b.round : a.date.localeCompare(b.date)));
  }

  async createMatch(payload: {
    id: string;
    seasonId: string;
    round: number;
    date: string;
    time: string;
    homeTeamId: string;
    awayTeamId: string;
  }): Promise<void> {
    const db = this.getFirestore();
    await setDoc(
      doc(db, 'matches', payload.id),
      {
        seasonId: payload.seasonId,
        round: payload.round,
        date: payload.date,
        time: payload.time,
        homeTeamId: payload.homeTeamId,
        awayTeamId: payload.awayTeamId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async saveMatchResult(payload: {
    matchId: string;
    homeGoals: number;
    awayGoals: number;
    playerStats: MatchPlayerStatInput[];
  }): Promise<void> {
    const db = this.getFirestore();
    const matchRef = doc(db, 'matches', payload.matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) {
      return;
    }

    await updateDoc(matchRef, {
      homeGoals: payload.homeGoals,
      awayGoals: payload.awayGoals,
      playerStats: payload.playerStats,
      updatedAt: serverTimestamp(),
    });

    const seasonId = (matchSnap.data()['seasonId'] as string | undefined) ?? '';
    if (seasonId) {
      await this.recomputeSeasonPlayerStats(seasonId);
    }
  }

  async saveMvpSummary(payload: {
    seasonId: string;
    category: MvpCategoryId;
    rankings: Array<{ playerId: string; value: number }>;
  }): Promise<void> {
    const db = this.getFirestore();
    const docId = `${payload.seasonId}_${payload.category}`;
    await setDoc(
      doc(db, 'mvp_summary', docId),
      {
        seasonId: payload.seasonId,
        category: payload.category,
        rankings: payload.rankings,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  getAdvancedCategories(): Array<{ id: AdvancedCategoryId; label: string }> {
    return [
      { id: 'gols', label: 'Gols' },
      { id: 'chute_a_gol', label: 'Chute a gol' },
      { id: 'defesas', label: 'Defesas' },
      { id: 'goleiro', label: 'Goleiro' },
      { id: 'cartoes', label: 'Cartoes' },
      { id: 'mvp_jogo', label: 'MVP Jogo' },
      { id: 'mvp_rodada', label: 'MVP Rodada' },
    ];
  }

  private getFirestore(): Firestore {
    if (this.firestore) {
      return this.firestore;
    }

    const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    this.firestore = getFirestore(app);
    return this.firestore;
  }

  private async setOnlyOneSeasonActive(activeSeasonId: string): Promise<void> {
    const db = this.getFirestore();
    const seasonsSnap = await getDocs(collection(db, 'seasons'));
    const batch = writeBatch(db);

    for (const seasonDoc of seasonsSnap.docs) {
      batch.set(
        doc(db, 'seasons', seasonDoc.id),
        { active: seasonDoc.id === activeSeasonId, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }

    await batch.commit();
  }

  private async recomputeSeasonPlayerStats(seasonId: string): Promise<void> {
    const db = this.getFirestore();
    const teamsSnap = await getDocs(query(collection(db, 'teams'), where('seasonId', '==', seasonId)));
    const teamIds = new Set(teamsSnap.docs.map((item) => item.id));

    const playersSnap = await getDocs(collection(db, 'players'));
    const seasonPlayers = playersSnap.docs
      .map((item) => ({ id: item.id, data: item.data() as Record<string, unknown> }))
      .filter(({ data }) => typeof data['teamId'] === 'string' && teamIds.has(data['teamId'] as string));

    const matchesSnap = await getDocs(query(collection(db, 'matches'), where('seasonId', '==', seasonId)));
    const totals = new Map<
      string,
      { gols: number; chute_a_gol: number; defesas: number; goleiro: number; cartoes: number; mvp_jogo: number; mvp_rodada: number }
    >();

    for (const matchDoc of matchesSnap.docs) {
      const playerStats = Array.isArray(matchDoc.data()['playerStats'])
        ? (matchDoc.data()['playerStats'] as MatchPlayerStatInput[])
        : [];

      for (const entry of playerStats) {
        if (!entry.playerId) {
          continue;
        }
        const current = totals.get(entry.playerId) ?? {
          gols: 0,
          chute_a_gol: 0,
          defesas: 0,
          goleiro: 0,
          cartoes: 0,
          mvp_jogo: 0,
          mvp_rodada: 0,
        };
        current.gols += Number(entry.gols || 0);
        current.chute_a_gol += Number(entry.chute_a_gol || 0);
        current.defesas += Number(entry.defesas || 0);
        current.goleiro += Number(entry.goleiro || 0);
        current.cartoes += Number(entry.cartoes || 0);
        current.mvp_jogo += Number(entry.mvp_jogo || 0);
        current.mvp_rodada += Number(entry.mvp_rodada || 0);
        totals.set(entry.playerId, current);
      }
    }

    const batch = writeBatch(db);
    for (const player of seasonPlayers) {
      const sum = totals.get(player.id) ?? {
        gols: 0,
        chute_a_gol: 0,
        defesas: 0,
        goleiro: 0,
        cartoes: 0,
        mvp_jogo: 0,
        mvp_rodada: 0,
      };

      batch.set(
        doc(db, 'players', player.id),
        {
          gols: sum.gols,
          chute_a_gol: sum.chute_a_gol,
          defesas: sum.defesas,
          goleiro: sum.goleiro,
          cartoes: sum.cartoes,
          mvp_jogo: sum.mvp_jogo,
          mvp_rodada: sum.mvp_rodada,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }

    await batch.commit();
  }

  private asDateInputValue(value: unknown): string {
    if (typeof value === 'string' && value.length >= 10) {
      return value.slice(0, 10);
    }
    return '';
  }
}

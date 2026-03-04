import { computed, Injectable, signal } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, Firestore, getDoc, getFirestore } from 'firebase/firestore';
import { AppRole } from '../models/app-role.model';
import { UserAccess } from '../models/user-access.model';
import { environment } from '../../../environments/environment';

interface FirestoreUsersDoc {
  role?: AppRole;
  active?: boolean;
  ativo?: boolean;
  teamId?: string | null;
  nome?: string;
  name?: string;
  imagemPerfil?: string;
  photoUrl?: string;
}

interface FirestoreAdminUserDoc {
  tipo?: string;
  active?: boolean;
  ativo?: boolean;
  nome?: string;
  imagemPerfil?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _isConfigured = signal(this.hasFirebaseConfig());
  private readonly _isAuthStateReady = signal(false);
  private readonly _role = signal<AppRole | null>(null);
  private readonly _teamId = signal<string | null>(null);
  private readonly _isActive = signal(false);
  private readonly _displayName = signal<string | null>(null);
  private readonly _photoUrl = signal<string | null>(null);
  private initialized = false;
  private authStateReadyPromise: Promise<void> = Promise.resolve();

  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isConfigured = this._isConfigured.asReadonly();
  readonly isAuthStateReady = this._isAuthStateReady.asReadonly();
  readonly role = this._role.asReadonly();
  readonly teamId = this._teamId.asReadonly();
  readonly isActive = this._isActive.asReadonly();
  readonly displayName = this._displayName.asReadonly();
  readonly photoUrl = this._photoUrl.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  constructor() {
    this.initAuth();
  }

  async login(email: string, password: string): Promise<void> {
    this.initAuth();

    if (!this.auth) {
      throw new Error('Firebase nao configurado. Preencha src/environments/environment.ts');
    }

    this._isLoading.set(true);
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } finally {
      this._isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    if (!this.auth) {
      return;
    }

    await signOut(this.auth);
  }

  waitForAuthState(): Promise<void> {
    return this.authStateReadyPromise;
  }

  private initAuth(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    if (!this._isConfigured()) {
      this._isAuthStateReady.set(true);
      return;
    }

    const app = getApps().length ? getApp() : initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
    this.authStateReadyPromise = new Promise<void>((resolve) => {
      onAuthStateChanged(this.auth!, async (user) => {
        this._user.set(user);
        await this.resolveUserAccess(user);
        if (!this._isAuthStateReady()) {
          this._isAuthStateReady.set(true);
          resolve();
        }
      });
    });
  }

  private hasFirebaseConfig(): boolean {
    const { apiKey, authDomain, projectId, appId } = environment.firebaseConfig;
    return [apiKey, authDomain, projectId, appId].every((value) => value.trim().length > 0);
  }

  private async resolveUserAccess(user: User | null): Promise<void> {
    if (!user) {
      this._role.set(null);
      this._teamId.set(null);
      this._isActive.set(false);
      this._displayName.set(null);
      this._photoUrl.set(null);
      return;
    }

    const firestoreAccess = await this.getUserAccessFromFirestore(user.uid);
    if (firestoreAccess) {
      this._role.set(firestoreAccess.role);
      this._teamId.set(firestoreAccess.teamId);
      this._isActive.set(firestoreAccess.active);
      this._displayName.set(firestoreAccess.displayName ?? user.displayName ?? user.email ?? null);
      this._photoUrl.set(firestoreAccess.photoUrl ?? user.photoURL ?? null);
      return;
    }

    const tokenResult = await getIdTokenResult(user);
    const claimRole = tokenResult.claims['role'];
    if (claimRole === 'time' || claimRole === 'admin_master') {
      this._role.set(claimRole);
      this._teamId.set(null);
      this._isActive.set(true);
      this._displayName.set(user.displayName ?? user.email ?? null);
      this._photoUrl.set(user.photoURL ?? null);
      return;
    }

    this._role.set(null);
    this._teamId.set(null);
    this._isActive.set(false);
    this._displayName.set(user.displayName ?? user.email ?? null);
    this._photoUrl.set(user.photoURL ?? null);
  }

  private async getUserAccessFromFirestore(uid: string): Promise<UserAccess | null> {
    if (!this.firestore) {
      return null;
    }

    try {
      const usersAccess = await this.getUserAccessFromUsersCollection(uid);
      if (usersAccess) {
        return usersAccess;
      }

      const adminUsersAccess = await this.getUserAccessFromAdminUsersCollection(uid);
      if (adminUsersAccess) {
        return adminUsersAccess;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async getUserAccessFromUsersCollection(uid: string): Promise<UserAccess | null> {
    if (!this.firestore) {
      return null;
    }

    const userRef = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as FirestoreUsersDoc;
    if (data.role !== 'time' && data.role !== 'admin_master') {
      return null;
    }

    const active = this.resolveActiveFlag(data.active, data.ativo);
    const teamId = typeof data.teamId === 'string' && data.teamId.trim().length > 0 ? data.teamId : null;
    return {
      role: data.role,
      active,
      teamId,
      displayName: this.normalizeString(data.nome ?? data.name),
      photoUrl: this.normalizeString(data.imagemPerfil ?? data.photoUrl),
    };
  }

  private async getUserAccessFromAdminUsersCollection(uid: string): Promise<UserAccess | null> {
    if (!this.firestore) {
      return null;
    }

    const adminUserRef = doc(this.firestore, 'admin_users', uid);
    const snapshot = await getDoc(adminUserRef);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as FirestoreAdminUserDoc;
    const tipo = typeof data.tipo === 'string' ? data.tipo.toUpperCase() : '';
    if (tipo !== 'MASTER' && tipo !== 'ADMIN') {
      return null;
    }

    const active = this.resolveActiveFlag(data.active, data.ativo);
    return {
      role: 'admin_master',
      active,
      teamId: null,
      displayName: this.normalizeString(data.nome),
      photoUrl: this.normalizeString(data.imagemPerfil),
    };
  }

  private resolveActiveFlag(active: boolean | undefined, ativo: boolean | undefined): boolean {
    if (typeof active === 'boolean') {
      return active;
    }
    if (typeof ativo === 'boolean') {
      return ativo;
    }
    return true;
  }

  private normalizeString(value: string | undefined): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }
}

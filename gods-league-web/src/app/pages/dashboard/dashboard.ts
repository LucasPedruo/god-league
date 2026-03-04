import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  AdminUserItem,
  DashboardAdminService,
  MatchItemAdmin,
  PlayerItemAdmin,
  SeasonItem,
  TeamItemAdmin,
} from '../../core/services/dashboard-admin.service';
import { MvpCategoryId } from '../../core/models/home-public.model';

type DashboardSection =
  | 'overview'
  | 'users'
  | 'seasons'
  | 'teams'
  | 'players'
  | 'matches'
  | 'results'
  | 'mvp';

type DashboardModal =
  | 'createUser'
  | 'editMyUser'
  | 'createSeason'
  | 'createTeam'
  | 'createPlayer'
  | 'createMatch'
  | 'createResult'
  | 'createMvp'
  | null;

type ToastType = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  private readonly adminService = inject(DashboardAdminService);

  protected readonly activeSection = signal<DashboardSection>('overview');
  protected readonly activeModal = signal<DashboardModal>(null);
  protected readonly loading = signal(false);

  protected readonly adminUsers = signal<AdminUserItem[]>([]);
  protected readonly seasons = signal<SeasonItem[]>([]);
  protected readonly teams = signal<TeamItemAdmin[]>([]);
  protected readonly players = signal<PlayerItemAdmin[]>([]);
  protected readonly matches = signal<MatchItemAdmin[]>([]);

  protected readonly toasts = signal<ToastItem[]>([]);
  private toastCounter = 0;

  protected readonly isMaster = computed(() => this.auth.role() === 'admin_master' && this.auth.isActive());

  protected readonly adminUserForm = this.fb.nonNullable.group({
    uid: ['', Validators.required],
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    tipo: this.fb.nonNullable.control<'MASTER' | 'ADMIN'>('ADMIN', Validators.required),
    ativo: this.fb.nonNullable.control(true),
    senha: [''],
  });

  protected readonly myUserForm = this.fb.nonNullable.group({
    uid: ['', Validators.required],
    nome: ['', Validators.required],
    imagemPerfil: [''],
  });

  protected readonly seasonForm = this.fb.nonNullable.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    year: this.fb.nonNullable.control(new Date().getFullYear(), Validators.required),
    active: this.fb.nonNullable.control(false),
  });

  protected readonly teamForm = this.fb.nonNullable.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    shieldUrl: [''],
    seasonId: ['', Validators.required],
    active: this.fb.nonNullable.control(true),
  });

  protected readonly playerForm = this.fb.nonNullable.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    teamId: ['', Validators.required],
    status: this.fb.nonNullable.control('validado', Validators.required),
  });

  protected readonly matchForm = this.fb.nonNullable.group({
    id: ['', Validators.required],
    seasonId: ['', Validators.required],
    round: this.fb.nonNullable.control(1, Validators.required),
    date: ['', Validators.required],
    time: ['', Validators.required],
    homeTeamId: ['', Validators.required],
    awayTeamId: ['', Validators.required],
  });

  protected readonly resultForm = this.fb.nonNullable.group({
    matchId: ['', Validators.required],
    homeGoals: this.fb.nonNullable.control(0, Validators.required),
    awayGoals: this.fb.nonNullable.control(0, Validators.required),
    playerStats: this.fb.array([]),
  });

  protected readonly mvpForm = this.fb.nonNullable.group({
    seasonId: ['', Validators.required],
    category: this.fb.nonNullable.control<MvpCategoryId>('artilheiro', Validators.required),
    p1PlayerId: ['', Validators.required],
    p1Value: this.fb.nonNullable.control(0, Validators.required),
    p2PlayerId: ['', Validators.required],
    p2Value: this.fb.nonNullable.control(0, Validators.required),
    p3PlayerId: ['', Validators.required],
    p3Value: this.fb.nonNullable.control(0, Validators.required),
  });

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  protected setSection(section: DashboardSection): void {
    this.activeSection.set(section);
  }

  protected openModal(modal: Exclude<DashboardModal, null>): void {
    if (modal === 'editMyUser') {
      this.prefillMyUserForm();
    }
    if (modal === 'createResult') {
      if (this.playerStatsArray.length === 0) {
        this.addPlayerStatRow();
      }
    }
    this.activeModal.set(modal);
  }

  protected closeModal(): void {
    this.activeModal.set(null);
  }

  protected async loadAll(): Promise<void> {
    if (!this.isMaster()) {
      return;
    }

    this.loading.set(true);
    try {
      const [adminUsers, seasons, teams, players, matches] = await Promise.all([
        this.adminService.listAdminUsers(),
        this.adminService.listSeasons(),
        this.adminService.listTeams(),
        this.adminService.listPlayers(),
        this.adminService.listMatches(),
      ]);

      this.adminUsers.set(adminUsers);
      this.seasons.set(seasons);
      this.teams.set(teams);
      this.players.set(players);
      this.matches.set(matches);
    } catch {
      this.addToast('error', 'Falha ao carregar dados administrativos.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async createAdminUser(): Promise<void> {
    if (this.adminUserForm.invalid) {
      this.adminUserForm.markAllAsTouched();
      return;
    }

    await this.wrapAction(
      'Cadastrando usuario...',
      'Usuario administrativo salvo com sucesso.',
      async () => {
        await this.adminService.createAdminUser(this.adminUserForm.getRawValue());
        this.adminUserForm.reset({ uid: '', nome: '', email: '', tipo: 'ADMIN', ativo: true, senha: '' });
        await this.loadAll();
        this.closeModal();
      },
    );
  }

  protected async saveMyUserProfile(): Promise<void> {
    if (this.myUserForm.invalid) {
      this.myUserForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando perfil...', 'Seu perfil foi atualizado.', async () => {
      const value = this.myUserForm.getRawValue();
      await this.adminService.updateOwnAdminUserProfile({
        uid: value.uid,
        nome: value.nome,
        imagemPerfil: value.imagemPerfil,
      });
      await this.loadAll();
      this.closeModal();
    });
  }

  protected async createSeason(): Promise<void> {
    if (this.seasonForm.invalid) {
      this.seasonForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando temporada...', 'Temporada salva com sucesso.', async () => {
      await this.adminService.createSeason(this.seasonForm.getRawValue());
      this.seasonForm.reset({ id: '', name: '', year: new Date().getFullYear(), active: false });
      await this.loadAll();
      this.closeModal();
    });
  }

  protected async activateSeason(seasonId: string): Promise<void> {
    await this.wrapAction('Ativando temporada...', 'Temporada ativada.', async () => {
      await this.adminService.setSeasonActive(seasonId);
      await this.loadAll();
    });
  }

  protected async createTeam(): Promise<void> {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando time...', 'Time salvo com sucesso.', async () => {
      await this.adminService.createTeam(this.teamForm.getRawValue());
      this.teamForm.reset({ id: '', name: '', shieldUrl: '', seasonId: '', active: true });
      await this.loadAll();
      this.closeModal();
    });
  }

  protected async deleteTeam(teamId: string): Promise<void> {
    await this.wrapAction('Removendo time...', 'Time removido.', async () => {
      await this.adminService.deleteTeam(teamId);
      await this.loadAll();
    });
  }

  protected async savePlayer(): Promise<void> {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando jogador...', 'Jogador salvo com sucesso.', async () => {
      await this.adminService.createOrUpdatePlayer(this.playerForm.getRawValue());
      this.playerForm.reset({ id: '', name: '', teamId: '', status: 'validado' });
      await this.loadAll();
      this.closeModal();
    });
  }

  protected editPlayer(player: PlayerItemAdmin): void {
    this.playerForm.patchValue({
      id: player.id,
      name: player.name,
      teamId: player.teamId,
      status: player.status,
    });
    this.openModal('createPlayer');
  }

  protected async deletePlayer(playerId: string): Promise<void> {
    await this.wrapAction('Removendo jogador...', 'Jogador removido.', async () => {
      await this.adminService.deletePlayer(playerId);
      await this.loadAll();
    });
  }

  protected async createMatch(): Promise<void> {
    if (this.matchForm.invalid) {
      this.matchForm.markAllAsTouched();
      return;
    }

    const values = this.matchForm.getRawValue();
    if (values.homeTeamId === values.awayTeamId) {
      this.addToast('error', 'Mandante e visitante nao podem ser o mesmo time.');
      return;
    }

    await this.wrapAction('Cadastrando jogo...', 'Jogo cadastrado com sucesso.', async () => {
      await this.adminService.createMatch(values);
      this.matchForm.reset({
        id: '',
        seasonId: '',
        round: 1,
        date: '',
        time: '',
        homeTeamId: '',
        awayTeamId: '',
      });
      await this.loadAll();
      this.closeModal();
    });
  }

  protected addPlayerStatRow(): void {
    this.playerStatsArray.push(
      this.fb.nonNullable.group({
        playerId: ['', Validators.required],
        gols: this.fb.nonNullable.control(0),
        chute_a_gol: this.fb.nonNullable.control(0),
        defesas: this.fb.nonNullable.control(0),
        goleiro: this.fb.nonNullable.control(0),
        cartoes: this.fb.nonNullable.control(0),
        mvp_jogo: this.fb.nonNullable.control(0),
        mvp_rodada: this.fb.nonNullable.control(0),
      }),
    );
  }

  protected removePlayerStatRow(index: number): void {
    this.playerStatsArray.removeAt(index);
  }

  protected async saveResult(): Promise<void> {
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando resultado...', 'Resultado e estatisticas salvos.', async () => {
      const formValue = this.resultForm.getRawValue();
      await this.adminService.saveMatchResult({
        matchId: formValue.matchId,
        homeGoals: Number(formValue.homeGoals),
        awayGoals: Number(formValue.awayGoals),
        playerStats: (formValue.playerStats as Array<Record<string, unknown>>).map((entry) => ({
          playerId: String(entry['playerId'] ?? ''),
          gols: Number(entry['gols'] ?? 0),
          chute_a_gol: Number(entry['chute_a_gol'] ?? 0),
          defesas: Number(entry['defesas'] ?? 0),
          goleiro: Number(entry['goleiro'] ?? 0),
          cartoes: Number(entry['cartoes'] ?? 0),
          mvp_jogo: Number(entry['mvp_jogo'] ?? 0),
          mvp_rodada: Number(entry['mvp_rodada'] ?? 0),
        })),
      });
      this.resultForm.reset({ matchId: '', homeGoals: 0, awayGoals: 0, playerStats: [] });
      this.playerStatsArray.clear();
      this.addPlayerStatRow();
      await this.loadAll();
      this.closeModal();
    });
  }

  protected async saveMvpSummary(): Promise<void> {
    if (this.mvpForm.invalid) {
      this.mvpForm.markAllAsTouched();
      return;
    }

    await this.wrapAction('Salvando MVP...', 'MVP da categoria salvo.', async () => {
      const values = this.mvpForm.getRawValue();
      await this.adminService.saveMvpSummary({
        seasonId: values.seasonId,
        category: values.category,
        rankings: [
          { playerId: values.p1PlayerId, value: Number(values.p1Value) },
          { playerId: values.p2PlayerId, value: Number(values.p2Value) },
          { playerId: values.p3PlayerId, value: Number(values.p3Value) },
        ],
      });
      this.closeModal();
    });
  }

  protected teamName(teamId: string): string {
    return this.teams().find((team) => team.id === teamId)?.name ?? teamId;
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }

  protected dismissToast(id: number): void {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }

  protected get playerStatsArray(): FormArray {
    return this.resultForm.controls.playerStats as FormArray;
  }

  private prefillMyUserForm(): void {
    const uid = this.auth.user()?.uid ?? '';
    const current = this.adminUsers().find((item) => item.uid === uid);
    this.myUserForm.reset({
      uid,
      nome: current?.nome ?? this.auth.displayName() ?? '',
      imagemPerfil: current?.imagemPerfil ?? this.auth.photoUrl() ?? '',
    });
  }

  private async wrapAction(processingMsg: string, successMsg: string, action: () => Promise<void>): Promise<void> {
    if (!this.isMaster()) {
      return;
    }

    this.loading.set(true);
    this.addToast('info', processingMsg);
    try {
      await action();
      this.addToast('success', successMsg);
    } catch {
      this.addToast('error', 'Operacao nao concluida. Verifique os dados e tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  private addToast(type: ToastType, message: string): void {
    const id = ++this.toastCounter;
    this.toasts.update((items) => [...items, { id, type, message }]);

    setTimeout(() => {
      this.toasts.update((items) => items.filter((item) => item.id !== id));
    }, 3500);
  }
}

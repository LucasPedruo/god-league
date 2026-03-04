import { Component, inject, OnInit, signal } from '@angular/core';
import { TeamItem } from '../../core/models/home-public.model';
import { HomePublicService } from '../../core/services/home-public.service';

@Component({
  selector: 'app-times',
  imports: [],
  templateUrl: './times.html',
  styleUrl: './times.scss',
})
export class Times implements OnInit {
  private readonly homePublicService = inject(HomePublicService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly teams = signal<TeamItem[]>([]);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async reload(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.teams.set(await this.homePublicService.getTeamsList());
    } catch {
      this.error.set('Nao foi possivel carregar os times.');
    } finally {
      this.loading.set(false);
    }
  }
}

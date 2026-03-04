import { Component, inject, OnInit, signal } from '@angular/core';
import { HomePublicData } from '../../core/models/home-public.model';
import { HomePublicService } from '../../core/services/home-public.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly homePublicService = inject(HomePublicService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly homeData = signal<HomePublicData>({
    teams: [],
    matches: [],
    mvpSummary: [],
  });

  protected readonly teams = () => this.homeData().teams;
  protected readonly matches = () => this.homeData().matches;
  protected readonly mvpSummary = () => this.homeData().mvpSummary;

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  protected async reload(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.homePublicService.getHomeData();
      this.homeData.set(data);
    } catch {
      this.error.set('Nao foi possivel carregar os dados da home. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { ClassificationRow } from '../../core/models/home-public.model';
import { HomePublicService } from '../../core/services/home-public.service';

@Component({
  selector: 'app-classificacao',
  imports: [],
  templateUrl: './classificacao.html',
  styleUrl: './classificacao.scss',
})
export class Classificacao implements OnInit {
  private readonly homePublicService = inject(HomePublicService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<ClassificationRow[]>([]);

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
      this.rows.set(await this.homePublicService.getClassification());
    } catch {
      this.error.set('Nao foi possivel carregar a classificacao.');
    } finally {
      this.loading.set(false);
    }
  }
}

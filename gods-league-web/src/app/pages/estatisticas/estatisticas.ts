import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AdvancedCategoryId,
  AdvancedStatCategory,
  AdvancedStatRow,
  StatsCategory,
} from '../../core/models/home-public.model';
import { HomePublicService } from '../../core/services/home-public.service';

@Component({
  selector: 'app-estatisticas',
  imports: [],
  templateUrl: './estatisticas.html',
  styleUrl: './estatisticas.scss',
})
export class Estatisticas implements OnInit {
  private readonly homePublicService = inject(HomePublicService);

  protected readonly categories = this.homePublicService.getAdvancedCategories();
  protected readonly selectedCategory = signal<AdvancedCategoryId>('gols');

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly summary = signal<StatsCategory[]>([]);
  protected readonly rows = signal<AdvancedStatRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  protected async reload(): Promise<void> {
    await this.loadAll();
  }

  protected async selectCategory(categoryId: AdvancedCategoryId): Promise<void> {
    if (this.selectedCategory() === categoryId) {
      return;
    }

    this.selectedCategory.set(categoryId);
    await this.loadCategoryRows(categoryId);
  }

  protected getCategoryTitle(category: AdvancedStatCategory): string {
    return category.title;
  }

  protected get selectedCategoryMeta(): AdvancedStatCategory {
    return this.categories.find((item) => item.id === this.selectedCategory()) ?? this.categories[0];
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const homeData = await this.homePublicService.getHomeData();
      this.summary.set(homeData.mvpSummary);
      await this.loadCategoryRows(this.selectedCategory());
    } catch {
      this.error.set('Nao foi possivel carregar as estatisticas.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCategoryRows(categoryId: AdvancedCategoryId): Promise<void> {
    try {
      this.rows.set(await this.homePublicService.getDetailedStats(categoryId));
    } catch {
      this.rows.set([]);
      this.error.set('Nao foi possivel carregar a categoria selecionada.');
    }
  }
}

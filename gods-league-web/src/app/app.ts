import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  protected readonly title = 'God League';
  protected readonly auth = inject(AuthService);
  protected readonly dashboardRoute = signal(this.router.url.startsWith('/dashboard'));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.dashboardRoute.set(this.router.url.startsWith('/dashboard'));
    });
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
  }
}

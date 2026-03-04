import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly errorMessage = signal('');

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    if (this.loginForm.invalid || this.auth.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    try {
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar. Tente novamente.';
      this.errorMessage.set(message);
    }
  }
}

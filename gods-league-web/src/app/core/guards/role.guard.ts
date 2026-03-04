import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/app-role.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] as AppRole[] | undefined) ?? [];

  if (roles.length === 0) {
    return true;
  }

  await auth.waitForAuthState();
  const userRole = auth.role();
  const isActive = auth.isActive();

  if (isActive && userRole && roles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/']);
};

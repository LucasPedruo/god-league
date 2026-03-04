import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { Classificacao } from './pages/classificacao/classificacao';
import { Dashboard } from './pages/dashboard/dashboard';
import { Estatisticas } from './pages/estatisticas/estatisticas';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { NotFound } from './pages/not-found/not-found';
import { Times } from './pages/times/times';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'classificacao', component: Classificacao },
  { path: 'times', component: Times },
  { path: 'estatisticas', component: Estatisticas },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['time', 'admin_master'] },
  },
  { path: '**', component: NotFound },
];

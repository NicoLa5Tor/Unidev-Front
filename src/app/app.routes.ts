import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'callback',
    loadComponent: () => import('./features/auth/pages/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/pages/users-panel/users-panel.component').then(m => m.UsersPanelComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['USUARIOS']
    }
  },
  {
    path: 'blackbird-experience',
    loadComponent: () =>
      import('./features/effects/pages/blackbird-experience/blackbird-experience.component').then(
        m => m.BlackbirdExperienceComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];

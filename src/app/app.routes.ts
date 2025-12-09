import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/pages/user-list/user-list.component').then(m => m.UserListComponent)
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

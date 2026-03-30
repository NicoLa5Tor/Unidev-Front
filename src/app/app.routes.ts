import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/home/home.component').then(m => m.HomeComponent),
    data: {
      publicHeader: true
    }
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
    path: 'access-denied',
    loadComponent: () =>
      import('./features/auth/pages/access-denied/access-denied.component').then(
        m => m.AccessDeniedComponent
      )
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
    path: 'admin/users',
    loadComponent: () => import('./features/admin/pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES']
    }
  },
  {
    path: 'admin/companies',
    loadComponent: () =>
      import('./features/admin/pages/admin-companies/admin-companies.component').then(
        m => m.AdminCompaniesComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES']
    }
  },
  {
    path: 'admin/email-templates',
    loadComponent: () =>
      import('./features/admin/pages/admin-email-templates/admin-email-templates.component').then(
        m => m.AdminEmailTemplatesComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES']
    }
  },
  {
    path: 'companies',
    loadComponent: () =>
      import('./features/companies/pages/companies-home/companies-home.component').then(
        m => m.CompaniesHomeComponent
      ),
    data: {
      publicHeader: true
    }
  },
  {
    path: 'companies/onboarding',
    loadComponent: () =>
      import('./features/companies/pages/company-onboarding/company-onboarding.component').then(
        m => m.CompanyOnboardingComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['EMPRESAS']
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
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pages/pricing/pricing.component').then(m => m.PricingComponent),
    data: {
      publicHeader: true
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

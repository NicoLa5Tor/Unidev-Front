import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'UniDev | Talento, proyectos y mentorias',
    loadComponent: () => import('./features/landing/pages/home/home.component').then(m => m.HomeComponent),
    data: {
      publicHeader: true,
      description: 'UniDev conecta talento, proyectos y mentorias en una sola plataforma para estudiantes, empresas y equipos.'
    }
  },
  {
    path: 'login',
    title: 'Iniciar sesion | UniDev',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      description: 'Accede a UniDev para continuar con tus proyectos, mentorias y procesos de colaboracion.'
    }
  },
  {
    path: 'callback',
    title: 'Procesando acceso | UniDev',
    loadComponent: () => import('./features/auth/pages/callback/callback.component').then(m => m.CallbackComponent),
    data: {
      description: 'UniDev esta validando tu acceso para completar el inicio de sesion.'
    }
  },
  {
    path: 'access-denied',
    title: 'Acceso denegado | UniDev',
    loadComponent: () =>
      import('./features/auth/pages/access-denied/access-denied.component').then(
        m => m.AccessDeniedComponent
      ),
    data: {
      description: 'No tienes permisos suficientes para acceder a este recurso dentro de UniDev.'
    }
  },
  {
    path: 'users',
    title: 'Panel de usuarios | UniDev',
    loadComponent: () => import('./features/users/pages/users-panel/users-panel.component').then(m => m.UsersPanelComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['USUARIOS', 'USUARIOS_EMPRESA'],
      description: 'Consulta y gestiona tu panel de usuario dentro de UniDev.'
    }
  },
  {
    path: 'admin/users',
    title: 'Administrar usuarios | UniDev',
    loadComponent: () => import('./features/admin/pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES'],
      description: 'Administra usuarios, accesos y configuraciones operativas en UniDev.'
    }
  },
  {
    path: 'admin/companies',
    title: 'Administrar empresas | UniDev',
    loadComponent: () =>
      import('./features/admin/pages/admin-companies/admin-companies.component').then(
        m => m.AdminCompaniesComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES'],
      description: 'Gestiona el alta, seguimiento y estado de empresas registradas en UniDev.'
    }
  },
  {
    path: 'admin/email-templates',
    title: 'Plantillas de correo | UniDev',
    loadComponent: () =>
      import('./features/admin/pages/admin-email-templates/admin-email-templates.component').then(
        m => m.AdminEmailTemplatesComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES'],
      description: 'Configura las plantillas de correo que utiliza UniDev en sus procesos administrativos.'
    }
  },
  {
    path: 'admin/project-pricing',
    title: 'Pricing de proyectos | UniDev',
    loadComponent: () =>
      import('./features/admin/pages/admin-project-pricing/admin-project-pricing.component').then(
        m => m.AdminProjectPricingComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMINISTRADORES'],
      description: 'Administra las tarifas junior y la base comercial de cotizacion para proyectos.'
    }
  },
  {
    path: 'companies',
    title: 'Empresas | UniDev',
    loadComponent: () =>
      import('./features/companies/pages/companies-home/companies-home.component').then(
        m => m.CompaniesHomeComponent
      ),
    data: {
      publicHeader: true,
      description: 'Conoce como UniDev ayuda a las empresas a vincular talento, gestionar onboarding y acelerar colaboraciones.'
    }
  },
  {
    path: 'universities',
    title: 'Universidades | UniDev',
    loadComponent: () =>
      import('./features/universities/pages/universities-home/universities-home.component').then(
        m => m.UniversitiesHomeComponent
      ),
    data: {
      publicHeader: true,
      organizationType: 'UNIVERSITY',
      description: 'Conoce como UniDev ayuda a las universidades a vincular administracion, estudiantes y colaboracion academica.'
    }
  },
  {
    path: 'companies/onboarding',
    title: 'Onboarding de empresa | UniDev',
    loadComponent: () =>
      import('./features/companies/pages/company-onboarding/company-onboarding.component').then(
        m => m.CompanyOnboardingComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['EMPRESAS'],
      description: 'Completa el proceso de onboarding de tu empresa dentro de UniDev.'
    }
  },
  {
    path: 'universities/onboarding',
    title: 'Onboarding de universidad | UniDev',
    loadComponent: () =>
      import('./features/companies/pages/company-onboarding/company-onboarding.component').then(
        m => m.CompanyOnboardingComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['UNIVERSIDADES'],
      organizationType: 'UNIVERSITY',
      description: 'Completa el proceso de onboarding de tu universidad dentro de UniDev.'
    }
  },
  {
    path: 'company/workspace',
    title: 'Espacio empresarial | UniDev',
    loadComponent: () =>
      import('./features/companies/pages/company-onboarding/company-onboarding.component').then(
        m => m.CompanyOnboardingComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['USUARIOS_EMPRESA'],
      description: 'Consulta y actualiza la informacion de tu empresa dentro de UniDev.'
    }
  },
  {
    path: 'university/workspace',
    title: 'Espacio estudiantil | UniDev',
    loadComponent: () =>
      import('./features/universities/pages/student-workspace/student-workspace.component').then(
        m => m.StudentWorkspaceComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['USUARIOS_UNIVERSIDAD'],
      description: 'Tu espacio estudiantil: proyectos, equipos y colaboracion universitaria.'
    }
  },
  {
    path: 'blackbird-experience',
    title: 'Blackbird Experience | UniDev',
    loadComponent: () =>
      import('./features/effects/pages/blackbird-experience/blackbird-experience.component').then(
        m => m.BlackbirdExperienceComponent
      ),
    data: {
      description: 'Explora la experiencia narrativa de UniDev sobre trabajo real, criterio y colaboracion.'
    }
  },
  {
    path: 'pricing',
    title: 'Precios | UniDev',
    loadComponent: () => import('./features/pricing/pages/pricing/pricing.component').then(m => m.PricingComponent),
    data: {
      publicHeader: true,
      description: 'Revisa los planes y precios de UniDev para personas, equipos y empresas.'
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

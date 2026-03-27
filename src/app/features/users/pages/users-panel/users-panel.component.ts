import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';

@Component({
  selector: 'app-users-panel',
  standalone: true,
  imports: [CommonModule, DashboardShellComponent],
  templateUrl: './users-panel.component.html'
})
export class UsersPanelComponent {
  activeTab: 'offers' | 'applications' | 'profile' = 'offers';
  readonly navItems: DashboardNavItem[] = [
    { id: 'offers', label: 'Ofertas', accent: 'accent-1', mobileBarWidthClass: 'w-20' },
    { id: 'applications', label: 'Aplicaciones', accent: 'accent-3', mobileBarWidthClass: 'w-24' },
    { id: 'profile', label: 'Perfil', accent: 'accent-2', mobileBarWidthClass: 'w-16' }
  ];

  offers = [
    {
      id: 1,
      title: 'Frontend Angular - Landing interactiva',
      company: 'NeonLabs',
      location: 'Remoto',
      budget: '$1,200 - $1,800',
      tags: ['Angular', 'Tailwind', 'Animations']
    },
    {
      id: 2,
      title: 'Dashboard B2B SaaS',
      company: 'Orbital Tech',
      location: 'Hibrido',
      budget: '$2,000',
      tags: ['UI', 'UX', 'Design System']
    },
    {
      id: 3,
      title: 'App de monitoreo IoT',
      company: 'Aether Systems',
      location: 'Remoto',
      budget: '$1,500',
      tags: ['Data Viz', 'Realtime', 'Charts']
    }
  ];

  applications = [
    {
      id: 1,
      title: 'Frontend Angular - Landing interactiva',
      company: 'NeonLabs',
      status: 'En revision',
      date: 'Hace 2 dias'
    },
    {
      id: 2,
      title: 'Dashboard B2B SaaS',
      company: 'Orbital Tech',
      status: 'Entrevista',
      date: 'Hace 1 dia'
    }
  ];

  profile = {
    name: 'Nicolas Rodriguez',
    role: 'Frontend Developer',
    location: 'Bogota, CO',
    email: 'nicolasrodriguezt@ucundinamarca.edu.co',
    skills: ['Angular', 'TypeScript', 'Tailwind', 'UI Motion', 'Figma']
  };

  setTab(tabId: string): void {
    if (tabId === 'offers' || tabId === 'applications' || tabId === 'profile') {
      this.activeTab = tabId;
    }
  }
}

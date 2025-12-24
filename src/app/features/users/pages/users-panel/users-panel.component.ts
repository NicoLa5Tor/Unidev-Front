import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeName, ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-users-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-panel.component.html'
})
export class UsersPanelComponent {
  activeTab: 'offers' | 'applications' | 'profile' = 'offers';
  isMobileMenuOpen = false;
  isHeaderCompact = false;
  themes: Array<{ id: ThemeName; label: string }> = [
    { id: 'cyber', label: 'Neon' },
    { id: 'light', label: 'Claro' },
    { id: 'abyss', label: 'Abyss' }
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly authService: AuthService
  ) {}

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

  get currentTheme(): ThemeName {
    return this.themeService.theme;
  }

  setTab(tab: 'offers' | 'applications' | 'profile'): void {
    this.activeTab = tab;
    this.isMobileMenuOpen = false;
  }

  setTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isHeaderCompact = window.scrollY > 80;
  }
}

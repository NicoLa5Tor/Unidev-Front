import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeName, ThemeService } from '../../../core/services/theme.service';

export interface DashboardNavItem {
  id: string;
  label: string;
  accent: 'accent-1' | 'accent-2' | 'accent-3' | 'accent-4';
  mobileBarWidthClass?: string;
}

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-shell.component.html'
})
export class DashboardShellComponent {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
  @Input() avatarLabel = 'UD';
  @Input() activeTab = '';
  @Input() navItems: DashboardNavItem[] = [];
  @Input() contentWidthClass = 'max-w-6xl';
  @Output() readonly tabChange = new EventEmitter<string>();

  isMobileMenuOpen = false;
  isHeaderCompact = false;

  readonly themes: Array<{ id: ThemeName; label: string }> = [
    { id: 'cyber', label: 'Neon' },
    { id: 'light', label: 'Claro' },
    { id: 'abyss', label: 'Abyss' }
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly authService: AuthService
  ) {}

  get currentTheme(): ThemeName {
    return this.themeService.theme;
  }

  setTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }

  selectTab(tabId: string): void {
    this.isMobileMenuOpen = false;
    this.tabChange.emit(tabId);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  navAccentText(item: DashboardNavItem): string {
    switch (item.accent) {
      case 'accent-2':
        return this.activeTab === item.id ? 'text-[var(--accent-2)]' : 'text-[var(--muted)] group-hover:text-[var(--accent-2)]';
      case 'accent-3':
        return this.activeTab === item.id ? 'text-[var(--accent-3)]' : 'text-[var(--muted)] group-hover:text-[var(--accent-3)]';
      case 'accent-4':
        return this.activeTab === item.id ? 'text-[var(--accent-4)]' : 'text-[var(--muted)] group-hover:text-[var(--accent-4)]';
      default:
        return this.activeTab === item.id ? 'text-[var(--accent-1)]' : 'text-[var(--muted)] group-hover:text-[var(--accent-1)]';
    }
  }

  navAccentBar(item: DashboardNavItem): string {
    switch (item.accent) {
      case 'accent-2':
        return 'bg-[var(--accent-2)]';
      case 'accent-3':
        return 'bg-[var(--accent-3)]';
      case 'accent-4':
        return 'bg-[var(--accent-4)]';
      default:
        return 'bg-[var(--accent-1)]';
    }
  }

  navBarState(item: DashboardNavItem): string {
    return this.activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60';
  }

  navMobileText(item: DashboardNavItem): string {
    switch (item.accent) {
      case 'accent-2':
        return this.activeTab === item.id ? 'text-[var(--accent-2)]' : 'text-[var(--muted)]';
      case 'accent-3':
        return this.activeTab === item.id ? 'text-[var(--accent-3)]' : 'text-[var(--muted)]';
      case 'accent-4':
        return this.activeTab === item.id ? 'text-[var(--accent-4)]' : 'text-[var(--muted)]';
      default:
        return this.activeTab === item.id ? 'text-[var(--accent-1)]' : 'text-[var(--muted)]';
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isHeaderCompact = window.scrollY > 80;
  }
}

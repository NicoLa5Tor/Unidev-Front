import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeName, ThemeService } from '../../../core/services/theme.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { PqrsService } from '../../services/pqrs.service';
import { DeploymentService } from '../../services/deployment.service';
import { NotificationsDialogComponent } from '../notifications-dialog/notifications-dialog.component';
import { AnnouncementService } from '../../../features/admin/services/announcement.service';

export interface DashboardNavItem {
  id: string;
  label: string;
  accent: 'accent-1' | 'accent-2' | 'accent-3' | 'accent-4';
  mobileBarWidthClass?: string;
  route?: string;
  children?: DashboardNavItem[];
}

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './dashboard-shell.component.html'
})
export class DashboardShellComponent implements OnChanges, OnInit {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
  @Input() avatarLabel = 'UD';
  @Input() avatarImageUrl: string | null = null;
  @Input() activeTab = '';
  @Input() navItems: DashboardNavItem[] = [];
  @Input() contentWidthClass = 'max-w-6xl';
  @Input() extraNotifCount = 0;
  @Output() readonly tabChange = new EventEmitter<string>();
  @Output() readonly notificationsDialogClosed = new EventEmitter<void>();

  isMobileMenuOpen = false;
  notifUnreadCount = 0;
  private readonly expandedNavIds = new Set<string>();

  readonly themes: Array<{ id: ThemeName; label: string }> = [
    { id: 'cyber', label: 'Neon' },
    { id: 'light', label: 'Claro' },
    { id: 'abyss', label: 'Abyss' }
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly authService: AuthService,
    private readonly userSessionService: UserSessionService,
    private readonly pqrsService: PqrsService,
    private readonly announcementService: AnnouncementService,
    private readonly deploymentService: DeploymentService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.refreshNotifCount();
    }
  }

  private refreshNotifCount(): void {
    const userId = this.userSessionService.snapshot?.id ?? 'anon';
    const lastSeenId = Number(localStorage.getItem(`lastSeenAnnouncement_${userId}`) ?? 0);
    let pqrsUnread = 0;
    let announcementUnread = 0;
    let deploymentPending = 0;

    this.pqrsService.mine().subscribe({
      next: tickets => {
        pqrsUnread = tickets.filter(t => t.adminResponse != null).length;
        this.notifUnreadCount = pqrsUnread + announcementUnread + deploymentPending;
      },
      error: () => {}
    });

    this.announcementService.inbox().subscribe({
      next: announcements => {
        announcementUnread = announcements.filter(a => a.id > lastSeenId).length;
        this.notifUnreadCount = pqrsUnread + announcementUnread + deploymentPending;
      },
      error: () => {}
    });

    if (this.isCompanyUser) {
      this.deploymentService.companyPendingReview().subscribe({
        next: deps => {
          deploymentPending = deps.length;
          this.notifUnreadCount = pqrsUnread + announcementUnread + deploymentPending;
        },
        error: () => {}
      });
    }
  }

  get isCompanyUser(): boolean {
    const role = this.userSessionService.snapshot?.roleName;
    return role === 'EMPRESAS' || role === 'USUARIOS_EMPRESA';
  }

  get isAdmin(): boolean {
    return this.userSessionService.snapshot?.roleName === 'ADMINISTRADORES';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navItems'] || changes['activeTab']) {
      this.syncExpandedParents();
    }
  }

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

  onNavItemClick(item: DashboardNavItem): void {
    if (item.children?.length) {
      this.toggleNavGroup(item.id);
      return;
    }

    this.activateLeaf(item);
  }

  onNavChildClick(item: DashboardNavItem): void {
    this.activateLeaf(item);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  openNotifications(): void {
    this.isMobileMenuOpen = false;
    this.dialog.open(NotificationsDialogComponent, {
      width: '540px',
      maxWidth: '94vw',
      panelClass: 'pqrs-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop'
    }).afterClosed().subscribe(() => {
      this.notificationsDialogClosed.emit();
      this.refreshNotifCount();
    });
  }

  get totalNotifCount(): number {
    return this.notifUnreadCount + this.extraNotifCount;
  }

  isNavGroupExpanded(item: DashboardNavItem): boolean {
    return this.expandedNavIds.has(item.id);
  }

  isNavItemActive(item: DashboardNavItem): boolean {
    if (item.children?.length) {
      return item.children.some(child => this.isNavItemActive(child));
    }

    if (item.route) {
      return this.isRouteActive(item.route);
    }

    return this.activeTab === item.id;
  }

  accentTextClass(item: DashboardNavItem): string {
    switch (item.accent) {
      case 'accent-2': return 'text-[var(--accent-2)]';
      case 'accent-3': return 'text-[var(--accent-3)]';
      case 'accent-4': return 'text-[var(--accent-4)]';
      default:         return 'text-[var(--accent-1)]';
    }
  }

  accentBgClass(item: DashboardNavItem): string {
    switch (item.accent) {
      case 'accent-2': return 'bg-[var(--accent-2)]';
      case 'accent-3': return 'bg-[var(--accent-3)]';
      case 'accent-4': return 'bg-[var(--accent-4)]';
      default:         return 'bg-[var(--accent-1)]';
    }
  }

  private activateLeaf(item: DashboardNavItem): void {
    this.isMobileMenuOpen = false;

    if (item.route) {
      void this.router.navigateByUrl(item.route);
      return;
    }

    this.tabChange.emit(item.id);
  }

  private toggleNavGroup(itemId: string): void {
    if (this.expandedNavIds.has(itemId)) {
      this.expandedNavIds.delete(itemId);
      return;
    }

    this.expandedNavIds.add(itemId);
  }

  private syncExpandedParents(): void {
    for (const item of this.navItems) {
      if (item.children?.some(child => this.isNavItemActive(child))) {
        this.expandedNavIds.add(item.id);
      }
    }
  }

  private isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(`${route}?`);
  }
}

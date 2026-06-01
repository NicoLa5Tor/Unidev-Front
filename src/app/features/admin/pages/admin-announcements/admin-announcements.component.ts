import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { AnnouncementService } from '../../services/announcement.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { Announcement } from '../../../../shared/models/announcement.model';

interface TargetOption { value: string | null; label: string; description: string }

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-announcements.component.html'
})
export class AdminAnnouncementsComponent implements OnInit {
  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-companies', label: 'Empresas', accent: 'accent-3', route: '/admin/companies' },
    { id: 'user-management', label: 'Usuarios', accent: 'accent-1', route: '/admin/users' },
    { id: 'admin-pricing', label: 'Pricing', accent: 'accent-2', route: '/admin/project-pricing' },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' },
    { id: 'admin-pqrs', label: 'PQRS', accent: 'accent-3', route: '/admin/pqrs' },
    { id: 'admin-announcements', label: 'Anuncios', accent: 'accent-1', route: '/admin/announcements' },
    { id: 'admin-disputes', label: 'Disputas', accent: 'accent-2', route: '/admin/disputes' }
  ];

  readonly targetOptions: TargetOption[] = [
    { value: null, label: 'Todos los usuarios', description: 'Empresas, estudiantes y todos los roles' },
    { value: 'EMPRESAS', label: 'Empresas', description: 'Usuarios con rol administrador de empresa' },
    { value: 'USUARIOS_EMPRESA', label: 'Miembros empresa', description: 'Empleados vinculados a una empresa' },
    { value: 'USUARIOS_UNIVERSIDAD', label: 'Estudiantes', description: 'Estudiantes universitarios' },
    { value: 'UNIVERSIDADES', label: 'Universidades', description: 'Administradores de universidad' }
  ];

  title = '';
  body = '';
  targetRole: string | null = null;
  sending = false;
  isLoading = false;
  history: Announcement[] = [];

  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly toast: UiToastService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.announcementService.listAll().subscribe({
      next: items => { this.history = items; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get canSend(): boolean {
    return this.title.trim().length > 0 && this.body.trim().length > 0 && !this.sending;
  }

  get targetLabel(): string {
    return this.targetOptions.find(o => o.value === this.targetRole)?.label ?? 'Todos';
  }

  send(): void {
    if (!this.canSend) return;
    this.sending = true;
    this.announcementService.send({
      title: this.title.trim(),
      body: this.body.trim(),
      targetRole: this.targetRole
    }).subscribe({
      next: ann => {
        this.history = [ann, ...this.history];
        this.title = '';
        this.body = '';
        this.targetRole = null;
        this.sending = false;
        this.toast.success(`Anuncio enviado a ${ann.recipientCount} usuario(s).`);
      },
      error: err => {
        this.sending = false;
        this.toast.error(err?.error?.message || 'No se pudo enviar el anuncio.');
      }
    });
  }

  roleLabel(role: string | null): string {
    return this.targetOptions.find(o => o.value === role)?.label ?? 'Todos';
  }
}

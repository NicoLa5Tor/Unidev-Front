import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { DisputeService, ProjectDispute } from '../../../../shared/services/dispute.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

@Component({
  selector: 'app-admin-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-disputes.component.html'
})
export class AdminDisputesComponent implements OnInit {
  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-companies', label: 'Empresas', accent: 'accent-3', route: '/admin/companies' },
    { id: 'user-management', label: 'Usuarios', accent: 'accent-1', route: '/admin/users' },
    { id: 'admin-pricing', label: 'Pricing', accent: 'accent-2', route: '/admin/project-pricing' },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' },
    { id: 'admin-pqrs', label: 'PQRS', accent: 'accent-3', route: '/admin/pqrs' },
    { id: 'admin-announcements', label: 'Anuncios', accent: 'accent-1', route: '/admin/announcements' },
    { id: 'admin-disputes', label: 'Disputas', accent: 'accent-2', route: '/admin/disputes' }
  ];

  private readonly disputeService = inject(DisputeService);
  private readonly toast = inject(UiToastService);

  isLoading = false;
  isSaving = false;
  items: ProjectDispute[] = [];
  selected: ProjectDispute | null = null;
  adminNotes = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.disputeService.listPending().subscribe({
      next: list => { this.items = list; this.isLoading = false; },
      error: () => { this.isLoading = false; this.toast.error('No se pudieron cargar las disputas.'); }
    });
  }

  select(d: ProjectDispute): void {
    this.selected = d;
    this.adminNotes = '';
  }

  closeSelected(): void {
    this.selected = null;
    this.adminNotes = '';
  }

  resolve(decision: 'APPROVED' | 'REJECTED'): void {
    if (!this.selected || this.isSaving) return;
    const notes = (this.adminNotes || '').trim() || null;
    this.isSaving = true;
    this.disputeService.resolve(this.selected.id, decision, notes).subscribe({
      next: () => {
        this.isSaving = false;
        const ok = decision === 'APPROVED';
        this.toast.success(ok ? 'Disputa aprobada. Proyecto cancelado.' : 'Disputa rechazada.');
        this.closeSelected();
        this.load();
      },
      error: err => {
        this.isSaving = false;
        this.toast.error(err?.error?.message || 'No se pudo resolver la disputa.');
      }
    });
  }
}

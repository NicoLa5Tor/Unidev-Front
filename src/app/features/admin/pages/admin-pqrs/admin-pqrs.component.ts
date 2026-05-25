import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { PqrsService } from '../../../../shared/services/pqrs.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { Pqrs, PqrsReplyRequest, PqrsStatus, PqrsType } from '../../../../shared/models/pqrs.model';

type FilterStatus = 'ALL' | PqrsStatus;

@Component({
  selector: 'app-admin-pqrs',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-pqrs.component.html'
})
export class AdminPqrsComponent implements OnInit {
  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-companies', label: 'Empresas', accent: 'accent-3', route: '/admin/companies' },
    { id: 'user-management', label: 'Usuarios', accent: 'accent-1', route: '/admin/users' },
    { id: 'admin-pricing', label: 'Pricing', accent: 'accent-2', route: '/admin/project-pricing' },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' },
    { id: 'admin-pqrs', label: 'PQRS', accent: 'accent-3', route: '/admin/pqrs' }
  ];

  isLoading = false;
  isSaving = false;
  items: Pqrs[] = [];
  filterStatus: FilterStatus = 'ALL';
  selected: Pqrs | null = null;
  replyText = '';
  closeOnReply = false;

  readonly statusOptions: Array<{ value: FilterStatus; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'OPEN', label: 'Abiertos' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'CLOSED', label: 'Cerrados' }
  ];

  readonly typeLabels: Record<PqrsType, string> = {
    PETICION: 'Petición',
    QUEJA: 'Queja',
    RECLAMO: 'Reclamo',
    SUGERENCIA: 'Sugerencia'
  };

  readonly statusLabels: Record<PqrsStatus, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En progreso',
    CLOSED: 'Cerrado'
  };

  constructor(
    private readonly pqrsService: PqrsService,
    private readonly toast: UiToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    const status = this.filterStatus === 'ALL' ? undefined : this.filterStatus;
    this.pqrsService.listAll(status).subscribe({
      next: items => { this.items = items; this.isLoading = false; },
      error: () => { this.toast.error('No se pudieron cargar las PQRS.'); this.isLoading = false; }
    });
  }

  onFilterChange(): void {
    this.selected = null;
    this.load();
  }

  select(item: Pqrs): void {
    this.selected = item;
    this.replyText = item.adminResponse ?? '';
    this.closeOnReply = item.status === 'CLOSED';
  }

  deselect(): void {
    this.selected = null;
    this.replyText = '';
    this.closeOnReply = false;
  }

  get canSendReply(): boolean {
    return this.replyText.trim().length > 0 && !this.isSaving;
  }

  sendReply(): void {
    if (!this.selected || !this.canSendReply) return;
    this.isSaving = true;
    const request: PqrsReplyRequest = { response: this.replyText.trim(), close: this.closeOnReply };
    this.pqrsService.reply(this.selected.id, request).subscribe({
      next: updated => {
        this.items = this.items.map(i => i.id === updated.id ? updated : i);
        this.selected = updated;
        this.isSaving = false;
        this.toast.success('Respuesta enviada.');
      },
      error: error => {
        this.isSaving = false;
        this.toast.error(error?.error?.message || 'No se pudo enviar la respuesta.');
      }
    });
  }

  statusAccent(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN': return 'text-emerald-400';
      case 'IN_PROGRESS': return 'text-[var(--accent-2)]';
      case 'CLOSED': return 'text-[var(--muted)]';
    }
  }

  statusDot(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN': return 'bg-emerald-400';
      case 'IN_PROGRESS': return 'bg-[var(--accent-2)]';
      case 'CLOSED': return 'bg-[var(--muted)]';
    }
  }

  typeAccent(type: PqrsType): string {
    switch (type) {
      case 'PETICION': return 'text-[var(--accent-1)]';
      case 'QUEJA': return 'text-rose-400';
      case 'RECLAMO': return 'text-amber-400';
      case 'SUGERENCIA': return 'text-[var(--accent-3)]';
    }
  }
}

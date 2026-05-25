import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { PqrsService } from '../../services/pqrs.service';
import { UiToastService } from '../../services/ui-toast.service';
import { Pqrs, PqrsStatus, PqrsType } from '../../models/pqrs.model';

type Tab = 'list' | 'new';

@Component({
  selector: 'app-pqrs-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './pqrs-dialog.component.html'
})
export class PqrsDialogComponent implements OnInit {
  tab: Tab = 'list';

  // list state
  tickets: Pqrs[] = [];
  loadingTickets = false;
  selectedTicket: Pqrs | null = null;

  // new ticket form
  type: PqrsType = 'PETICION';
  subject = '';
  message = '';
  sending = false;
  sent: Pqrs | null = null;

  readonly types: Array<{ value: PqrsType; label: string; description: string }> = [
    { value: 'PETICION', label: 'Petición', description: 'Solicitud de un servicio o información' },
    { value: 'QUEJA', label: 'Queja', description: 'Inconformidad con el servicio recibido' },
    { value: 'RECLAMO', label: 'Reclamo', description: 'Exigencia de un derecho o corrección' },
    { value: 'SUGERENCIA', label: 'Sugerencia', description: 'Propuesta para mejorar la plataforma' }
  ];

  readonly typeLabels: Record<PqrsType, string> = {
    PETICION: 'Petición', QUEJA: 'Queja', RECLAMO: 'Reclamo', SUGERENCIA: 'Sugerencia'
  };

  readonly statusLabels: Record<PqrsStatus, string> = {
    OPEN: 'Abierto', IN_PROGRESS: 'En progreso', CLOSED: 'Cerrado'
  };

  constructor(
    private readonly dialogRef: MatDialogRef<PqrsDialogComponent>,
    private readonly pqrsService: PqrsService,
    private readonly toast: UiToastService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loadingTickets = true;
    this.pqrsService.mine().subscribe({
      next: tickets => { this.tickets = tickets; this.loadingTickets = false; },
      error: () => { this.loadingTickets = false; }
    });
  }

  switchTab(t: Tab): void {
    this.tab = t;
    this.selectedTicket = null;
    if (t === 'list') {
      this.resetForm();
    }
  }

  selectTicket(ticket: Pqrs): void {
    this.selectedTicket = this.selectedTicket?.id === ticket.id ? null : ticket;
  }

  get canSend(): boolean {
    return this.subject.trim().length > 0 && this.message.trim().length > 0 && !this.sending;
  }

  send(): void {
    if (!this.canSend) return;
    this.sending = true;
    this.pqrsService.create({ type: this.type, subject: this.subject.trim(), message: this.message.trim() }).subscribe({
      next: pqrs => {
        this.sent = pqrs;
        this.sending = false;
        this.tickets = [pqrs, ...this.tickets];
      },
      error: error => {
        this.sending = false;
        this.toast.error(error?.error?.message || 'No pudimos enviar tu solicitud.');
      }
    });
  }

  afterSentClose(): void {
    this.dialogRef.close(this.sent);
  }

  backToList(): void {
    this.sent = null;
    this.resetForm();
    this.tab = 'list';
  }

  close(): void {
    this.dialogRef.close(this.sent);
  }

  statusDot(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN': return 'bg-emerald-400';
      case 'IN_PROGRESS': return 'bg-[var(--accent-2)]';
      case 'CLOSED': return 'bg-[var(--muted)]';
    }
  }

  statusText(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN': return 'text-emerald-400';
      case 'IN_PROGRESS': return 'text-[var(--accent-2)]';
      case 'CLOSED': return 'text-[var(--muted)]';
    }
  }

  private resetForm(): void {
    this.type = 'PETICION';
    this.subject = '';
    this.message = '';
    this.sending = false;
    this.sent = null;
  }
}

import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ApplicationService } from '../../../features/companies/services/application.service';
import { StudentService } from '../../../features/universities/services/student.service';
import { UiToastService } from '../../services/ui-toast.service';
import { ApplicationNegotiationMessage, ApplicationNegotiationThread } from '../../models/project-application.model';

export interface ApplicationNegotiationDialogData {
  viewerMode: 'company' | 'student';
  applicationId: number;
  projectId?: number;
}

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'app-application-negotiation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './application-negotiation-dialog.component.html',
  styleUrl: './application-negotiation-dialog.component.scss'
})
export class ApplicationNegotiationDialogComponent implements OnDestroy {
  isLoading = true;
  sending = false;
  acceptingMessageId: number | null = null;
  hiring = false;
  thread: ApplicationNegotiationThread | null = null;
  draftMessage = '';
  draftAmount: number | null = null;
  private pollHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<ApplicationNegotiationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: ApplicationNegotiationDialogData,
    private readonly applicationService: ApplicationService,
    private readonly studentService: StudentService,
    private readonly toast: UiToastService
  ) {
    this.loadThread();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get isStudentView(): boolean {
    return this.data.viewerMode === 'student';
  }

  get counterpartLabel(): string {
    if (!this.thread) {
      return 'Negociación';
    }
    return this.isStudentView
      ? (this.thread.companyName || 'Empresa')
      : (this.thread.applicantDisplayName || 'Postulante');
  }

  get canSubmit(): boolean {
    if (!this.thread?.canSendMessages || this.sending) {
      return false;
    }
    if (this.draftAmount != null) {
      return this.draftAmount > 0 && this.draftMessage.trim().length > 0;
    }
    return this.draftMessage.trim().length > 0;
  }

  close(): void {
    this.dialogRef.close(this.thread);
  }

  isOwnMessage(message: ApplicationNegotiationMessage): boolean {
    return this.isStudentView
      ? message.senderRole === 'STUDENT'
      : message.senderRole === 'COMPANY';
  }

  senderLabel(message: ApplicationNegotiationMessage): string {
    if (message.senderRole === 'STUDENT') {
      return this.isStudentView ? 'Tú' : (message.senderDisplayName || 'Estudiante');
    }
    return this.isStudentView ? (message.senderDisplayName || this.thread?.companyName || 'Empresa') : 'Tu empresa';
  }

  canAcceptProposal(message: ApplicationNegotiationMessage): boolean {
    if (!this.thread?.canSendMessages || message.proposedAmount == null || message.acceptedProposal) {
      return false;
    }
    return this.isStudentView
      ? message.senderRole === 'COMPANY'
      : message.senderRole === 'STUDENT';
  }

  send(): void {
    if (!this.canSubmit) {
      return;
    }

    const payload = {
      message: this.draftMessage.trim() || null,
      proposedAmount: this.draftAmount != null ? this.draftAmount : null
    };

    this.sending = true;
    const request$ = this.isStudentView
      ? this.studentService.sendApplicationNegotiationMessage(this.data.applicationId, payload)
      : this.applicationService.sendNegotiationMessage(this.data.projectId!, this.data.applicationId, payload);

    request$.subscribe({
      next: thread => {
        this.thread = thread;
        this.draftMessage = '';
        this.draftAmount = null;
        this.sending = false;
        this.syncPolling();
      },
      error: error => {
        this.sending = false;
        this.toast.error(error?.error?.message || 'No pudimos enviar la contraoferta.');
      }
    });
  }

  acceptProposal(message: ApplicationNegotiationMessage): void {
    if (!this.thread || !this.canAcceptProposal(message) || this.acceptingMessageId != null) {
      return;
    }

    this.acceptingMessageId = message.id;
    const request$ = this.isStudentView
      ? this.studentService.acceptApplicationNegotiationProposal(this.data.applicationId, message.id)
      : this.applicationService.acceptNegotiationProposal(this.data.projectId!, this.data.applicationId, message.id);

    request$.subscribe({
      next: thread => {
        this.thread = thread;
        this.acceptingMessageId = null;
        // Company accepting student's proposal = hire completed → close and notify parent
        if (!this.isStudentView) {
          this.dialogRef.close({ hired: true });
          return;
        }
        this.syncPolling();
      },
      error: error => {
        this.acceptingMessageId = null;
        this.toast.error(error?.error?.message || 'No pudimos aceptar la propuesta.');
      }
    });
  }

  formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    if (amount == null) {
      return 'Sin monto';
    }
    const normalizedCurrency = currency || 'COP';
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: normalizedCurrency,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${amount} ${normalizedCurrency}`;
    }
  }

  get waitingForCompany(): boolean {
    return this.isStudentView
      && this.thread?.applicationStatus === 'PENDING'
      && !this.thread?.canSendMessages;
  }

  get waitingForStudent(): boolean {
    return !this.isStudentView
      && this.thread?.applicationStatus === 'PENDING'
      && !this.thread?.canSendMessages;
  }

  /** Company view: student accepted a company proposal — show hire banner */
  get studentAcceptedCompanyOffer(): boolean {
    return !this.isStudentView
      && this.thread?.acceptedProposalAcceptedByRole === 'STUDENT'
      && this.thread?.acceptedProposalAmount != null;
  }

  contratar(): void {
    if (!this.thread || this.hiring || this.data.projectId == null) return;
    this.hiring = true;
    this.applicationService.updateStatus(this.data.projectId, this.thread.applicationId, 'ACCEPTED').subscribe({
      next: () => {
        this.hiring = false;
        this.dialogRef.close({ hired: true });
      },
      error: error => {
        this.hiring = false;
        this.toast.error(error?.error?.message || 'No pudimos contratar al postulante.');
      }
    });
  }

  get statusLabel(): string {
    switch (this.thread?.applicationStatus) {
      case 'PENDING': return 'Esperando respuesta';
      case 'NEGOTIATING': return 'En negociación';
      case 'ACCEPTED': return 'Aceptada';
      case 'REJECTED': return 'Rechazada';
      default: return '—';
    }
  }

  get statusTone(): string {
    switch (this.thread?.applicationStatus) {
      case 'NEGOTIATING': return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
      case 'ACCEPTED': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
      case 'REJECTED': return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
      default: return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    }
  }

  refreshThread(): void {
    const request$ = this.isStudentView
      ? this.studentService.getApplicationNegotiation(this.data.applicationId)
      : this.applicationService.getNegotiation(this.data.projectId!, this.data.applicationId);

    request$.subscribe({
      next: thread => { this.thread = thread; this.syncPolling(); },
      error: () => { /* silent background refresh */ }
    });
  }

  private syncPolling(): void {
    this.stopPolling();
    // Poll while negotiation is live (PENDING or NEGOTIATING) and dialog stays open
    const status = this.thread?.applicationStatus;
    if (status === 'PENDING' || status === 'NEGOTIATING') {
      this.pollHandle = setTimeout(() => this.refreshThread(), POLL_INTERVAL_MS);
    }
  }

  private stopPolling(): void {
    if (this.pollHandle != null) {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private loadThread(): void {
    this.isLoading = true;
    const request$ = this.isStudentView
      ? this.studentService.getApplicationNegotiation(this.data.applicationId)
      : this.applicationService.getNegotiation(this.data.projectId!, this.data.applicationId);

    request$.subscribe({
      next: thread => {
        this.thread = thread;
        this.isLoading = false;
        this.syncPolling();
      },
      error: error => {
        this.isLoading = false;
        this.toast.error(error?.error?.message || 'No pudimos cargar la negociación.');
        this.dialogRef.close();
      }
    });
  }
}

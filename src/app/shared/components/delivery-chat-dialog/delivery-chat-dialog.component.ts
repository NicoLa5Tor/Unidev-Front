import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeploymentService } from '../../services/deployment.service';
import { UiToastService } from '../../services/ui-toast.service';
import { ApplicationDeliveryChatMessage, ApplicationDeliveryChatThread } from '../../models/deployment.model';
import { PaymentService } from '../../../features/companies/services/payment.service';
import { ProjectPaymentResponse } from '../../models/payment.model';

export interface DeliveryChatDialogData {
  applicationId: number;
  projectId?: number;
  viewerMode: 'company' | 'student';
}

export interface StagedFile {
  file: File;
  name: string;
  sizeLabel: string;
  type: 'IMAGE' | 'VIDEO' | 'DOC';
  previewUrl: string | null;
}

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'app-delivery-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './delivery-chat-dialog.component.html',
  styleUrl: './delivery-chat-dialog.component.scss'
})
export class DeliveryChatDialogComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  isLoading = true;
  sending = false;
  thread: ApplicationDeliveryChatThread | null = null;
  draftMessage = '';
  stagedFile: StagedFile | null = null;
  expandedDeployments = new Set<string>();
  payment: ProjectPaymentResponse | null = null;
  releasingPayment = false;
  private pollHandle: ReturnType<typeof setTimeout> | null = null;
  private objectUrls: string[] = [];

  private readonly deploymentService = inject(DeploymentService);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(UiToastService);
  private readonly dialogRef = inject(MatDialogRef<DeliveryChatDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: DeliveryChatDialogData) {}

  ngOnInit(): void {
    this.load();
    if (!this.isStudentView && this.data.projectId) {
      this.loadPayment();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.objectUrls.forEach(u => URL.revokeObjectURL(u));
  }

  get isStudentView(): boolean {
    return this.data.viewerMode === 'student';
  }

  get canSend(): boolean {
    return !this.sending && (this.draftMessage.trim().length > 0 || this.stagedFile != null);
  }

  load(): void {
    this.isLoading = true;
    this.deploymentService.getDeliveryChatThread(this.data.applicationId).subscribe({
      next: thread => {
        this.thread = thread;
        this.isLoading = false;
        this.scheduleScroll();
        this.schedulePoll();
      },
      error: err => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'No se pudo cargar el chat de entrega.');
        this.dialogRef.close();
      }
    });
  }

  refresh(): void {
    this.deploymentService.getDeliveryChatThread(this.data.applicationId).subscribe({
      next: thread => {
        this.thread = thread;
        this.scheduleScroll();
        this.schedulePoll();
      },
      error: () => {}
    });
  }

  send(): void {
    if (!this.canSend) return;
    const text = this.draftMessage.trim();
    const staged = this.stagedFile;

    this.sending = true;
    this.draftMessage = '';
    this.stagedFile = null;

    const obs = staged
      ? this.deploymentService.sendDeliveryChatAttachment(this.data.applicationId, staged.file, text || undefined)
      : this.deploymentService.sendDeliveryChatMessage(this.data.applicationId, text);

    obs.subscribe({
      next: msg => {
        if (this.thread) {
          this.thread = { ...this.thread, messages: [...this.thread.messages, msg] };
        }
        this.sending = false;
        this.scheduleScroll();
      },
      error: err => {
        this.sending = false;
        this.draftMessage = text;
        if (staged) this.stagedFile = staged;
        this.toast.error(err?.error?.message || 'No se pudo enviar.');
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (file.size > 50 * 1024 * 1024) {
      this.toast.error('El archivo supera el límite de 50 MB.');
      return;
    }

    const type = this.resolveType(file.type);
    let previewUrl: string | null = null;
    if (type === 'IMAGE') {
      previewUrl = URL.createObjectURL(file);
      this.objectUrls.push(previewUrl);
    }

    this.stagedFile = {
      file,
      name: file.name,
      sizeLabel: this.formatSize(file.size),
      type,
      previewUrl
    };
  }

  removeStagedFile(): void {
    this.stagedFile = null;
  }

  toggleDeployment(deploymentId: string): void {
    if (this.expandedDeployments.has(deploymentId)) {
      this.expandedDeployments.delete(deploymentId);
    } else {
      this.expandedDeployments.add(deploymentId);
    }
  }

  isExpanded(deploymentId: string): boolean {
    return this.expandedDeployments.has(deploymentId);
  }

  isOwnMessage(msg: ApplicationDeliveryChatMessage): boolean {
    return this.isStudentView ? msg.senderRole === 'STUDENT' : msg.senderRole === 'COMPANY';
  }

  senderLabel(msg: ApplicationDeliveryChatMessage): string {
    if (msg.senderRole === 'STUDENT') {
      return this.isStudentView ? 'Tú' : (msg.senderDisplayName || 'Estudiante');
    }
    return this.isStudentView ? (msg.senderDisplayName || this.thread?.companyName || 'Empresa') : 'Tu empresa';
  }

  isImage(msg: ApplicationDeliveryChatMessage): boolean {
    return msg.attachmentType === 'IMAGE';
  }

  isVideo(msg: ApplicationDeliveryChatMessage): boolean {
    return msg.attachmentType === 'VIDEO';
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  }

  loadPayment(): void {
    if (!this.data.projectId) return;
    this.paymentService.getPaymentStatus(this.data.projectId).subscribe({
      next: p => { this.payment = p; },
      error: () => {}
    });
  }

  releasePayment(): void {
    if (!this.data.projectId || this.releasingPayment) return;
    this.releasingPayment = true;
    this.paymentService.releasePayment(this.data.projectId).subscribe({
      next: p => {
        this.payment = p;
        this.releasingPayment = false;
        this.toast.success('Pago desembolsado correctamente al equipo.');
      },
      error: err => {
        this.releasingPayment = false;
        this.toast.error(err?.error?.message ?? 'No se pudo desembolsar el pago.');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private resolveType(contentType: string): 'IMAGE' | 'VIDEO' | 'DOC' {
    if (contentType.startsWith('image/')) return 'IMAGE';
    if (contentType.startsWith('video/')) return 'VIDEO';
    return 'DOC';
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private scheduleScroll(): void {
    setTimeout(() => {
      try { this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
    }, 50);
  }

  private schedulePoll(): void {
    this.stopPolling();
    this.pollHandle = setTimeout(() => this.refresh(), POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollHandle != null) {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    }
  }
}

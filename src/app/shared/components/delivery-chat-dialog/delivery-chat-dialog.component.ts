import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeploymentLogsDialogComponent } from '../deployment-modal/deployment-logs-dialog.component';
import { Subscription } from 'rxjs';
import { DeploymentService } from '../../services/deployment.service';
import { DeliveryChatWsService } from '../../services/delivery-chat-ws.service';
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
  selectedDeploymentId: string | null = null;
  expandedDeployments = new Set<string>();
  payment: ProjectPaymentResponse | null = null;
  releasingPayment = false;

  private wsSub: Subscription | null = null;
  private objectUrls: string[] = [];

  private readonly deploymentService = inject(DeploymentService);
  private readonly wsService = inject(DeliveryChatWsService);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(UiToastService);
  private readonly dialogRef = inject(MatDialogRef<DeliveryChatDialogComponent>);
  private readonly dialog = inject(MatDialog);

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: DeliveryChatDialogData) {}

  ngOnInit(): void {
    this.load();
    if (!this.isStudentView && this.data.projectId) {
      this.loadPayment();
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.wsService.unsubscribe(this.data.applicationId);
    this.objectUrls.forEach(u => URL.revokeObjectURL(u));
  }

  get isStudentView(): boolean {
    return this.data.viewerMode === 'student';
  }

  get canSend(): boolean {
    return !this.sending && (this.draftMessage.trim().length > 0 || this.stagedFile != null);
  }

  get visibleMessages(): ApplicationDeliveryChatMessage[] {
    if (!this.thread) return [];
    const sel = this.selectedDeploymentId;
    return this.thread.messages.filter(m => (m.deploymentId ?? null) === sel);
  }

  get selectedDeploymentSubdomain(): string | null {
    if (!this.selectedDeploymentId || !this.thread) return null;
    const dep = this.thread.publishedDeployments.find(d => d.id === this.selectedDeploymentId);
    return dep?.subdomain ?? null;
  }

  selectThread(deploymentId: string | null): void {
    this.selectedDeploymentId = deploymentId;
    this.scheduleScroll();
  }

  unreadInDeployment(deploymentId: string): number {
    if (!this.thread) return 0;
    return this.thread.messages.filter(m => m.deploymentId === deploymentId).length;
  }

  unreadInGeneral(): number {
    if (!this.thread) return 0;
    return this.thread.messages.filter(m => !m.deploymentId).length;
  }

  load(): void {
    this.isLoading = true;
    this.deploymentService.getDeliveryChatThread(this.data.applicationId).subscribe({
      next: thread => {
        this.thread = thread;
        this.isLoading = false;
        this.scheduleScroll();
        this.initWebSocket();
      },
      error: err => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'No se pudo cargar el chat de entrega.');
        this.dialogRef.close();
      }
    });
  }

  send(): void {
    if (!this.canSend) return;
    const text = this.draftMessage.trim();
    const staged = this.stagedFile;

    this.sending = true;
    this.draftMessage = '';
    this.stagedFile = null;

    const depId = this.selectedDeploymentId;
    const obs = staged
      ? this.deploymentService.sendDeliveryChatAttachment(this.data.applicationId, staged.file, text || undefined, depId)
      : this.deploymentService.sendDeliveryChatMessage(this.data.applicationId, text, depId);

    obs.subscribe({
      next: msg => {
        // WS broadcast will deliver to the other party; append locally for sender's own view
        this.appendMessage(msg);
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

  onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          this.stageFile(file);
          return;
        }
      }
    }
  }

  private stageFile(file: File): void {
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
    this.stagedFile = { file, name: file.name || 'pasted-file', sizeLabel: this.formatSize(file.size), type, previewUrl };
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.stageFile(file);
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

  resyncingId: string | null = null;
  confirmingResyncId: string | null = null;
  resyncPort: number | null = null;
  resyncEnv = '';

  requestResync(deploymentId: string): void {
    if (this.resyncingId) return;
    const next = this.confirmingResyncId === deploymentId ? null : deploymentId;
    this.confirmingResyncId = next;
    this.resyncPort = null;
    this.resyncEnv = '';
  }

  cancelResync(): void {
    this.confirmingResyncId = null;
    this.resyncPort = null;
    this.resyncEnv = '';
  }

  confirmResync(deploymentId: string): void {
    if (this.resyncingId) return;
    const port = this.resyncPort;
    const env = this.resyncEnv.trim() || null;
    this.confirmingResyncId = null;
    this.resyncingId = deploymentId;
    this.deploymentService.resync(deploymentId, port, env).subscribe({
      next: () => {
        this.resyncingId = null;
        this.toast.success('Aplicando cambios desde GitHub.');
        this.dialog.open(DeploymentLogsDialogComponent, {
          width: '720px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          panelClass: 'app-shell-dialog-panel',
          backdropClass: 'app-shell-dialog-backdrop',
          data: { deploymentId }
        });
      },
      error: err => {
        this.resyncingId = null;
        this.toast.error(err?.error?.message || 'No se pudo resincronizar.');
      }
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

  private initWebSocket(): void {
    this.wsService.connect();
    this.wsSub = this.wsService.messages$(this.data.applicationId).subscribe(msg => {
      // Ignore echoes of messages the sender already appended locally
      const alreadyPresent = this.thread?.messages.some(m => m.id === msg.id) ?? false;
      if (!alreadyPresent) {
        this.appendMessage(msg);
        this.scheduleScroll();
      }
    });
  }

  private appendMessage(msg: ApplicationDeliveryChatMessage): void {
    if (!this.thread) return;
    // Deduplicate: REST response and WS echo can both arrive
    if (this.thread.messages.some(m => m.id === msg.id)) return;
    this.thread = { ...this.thread, messages: [...this.thread.messages, msg] };
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
}

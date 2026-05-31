import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeploymentService } from '../../services/deployment.service';
import { Deployment } from '../../models/deployment.model';
import { UiToastService } from '../../services/ui-toast.service';
import { DeploymentLogsDialogComponent } from './deployment-logs-dialog.component';
import { DeploymentModalComponent } from './deployment-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PublishReviewDialogComponent } from './publish-review-dialog.component';

interface ListDialogData {
  applicationId: number;
}

@Component({
  selector: 'app-deployment-list-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployment-list-dialog.component.html'
})
export class DeploymentListDialogComponent implements OnInit {
  private readonly deploymentService = inject(DeploymentService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<DeploymentListDialogComponent>);
  private readonly toast = inject(UiToastService);

  deployments: Deployment[] = [];
  trashed: Deployment[] = [];
  isLoading = true;
  view: 'active' | 'trash' = 'active';

  constructor(@Inject(MAT_DIALOG_DATA) public data: ListDialogData) {}

  ngOnInit(): void {
    this.load();
  }

  setView(v: 'active' | 'trash'): void {
    if (this.view === v) return;
    this.view = v;
    this.load();
  }

  get currentList(): Deployment[] {
    return this.view === 'trash' ? this.trashed : this.deployments;
  }

  get appHasPublished(): boolean {
    return this.deployments.some(d => d.publishedAt && d.status !== 'TRASHED');
  }

  get hasPublishableDeployments(): boolean {
    return this.deployments.some(d => d.status === 'ACTIVE' || d.status === 'READY');
  }

  load(): void {
    if (this.currentList.length === 0) this.isLoading = true;
    const obs = this.view === 'trash'
      ? this.deploymentService.listTrashByApplication(this.data.applicationId)
      : this.deploymentService.listByApplication(this.data.applicationId);
    obs.subscribe({
      next: list => {
        if (this.view === 'trash') this.trashed = list;
        else this.deployments = list;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('No se pudo cargar la lista');
      }
    });
  }

  permanentDelete(deploymentId: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: {
        title: 'Eliminar definitivamente',
        message: 'El registro y los logs se perderán para siempre. Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        variant: 'danger'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.deploymentService.permanentDelete(deploymentId).subscribe({
        next: () => {
          this.toast.success('Deployment eliminado de la papelera');
          this.load();
        },
        error: () => this.toast.error('No se pudo eliminar')
      });
    });
  }

  openLogs(deploymentId: string): void {
    const ref = this.dialog.open(DeploymentLogsDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '90vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: { deploymentId, applicationId: this.data.applicationId }
    });
    ref.afterClosed().subscribe(() => this.load());
  }

  openPublish(): void {
    const firstActive = this.deployments.find(d => d.status === 'ACTIVE');
    this.dialog.open(PublishReviewDialogComponent, {
      width: '580px',
      maxWidth: '94vw',
      maxHeight: '90vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: {
        applicationId: this.data.applicationId,
        preselectedId: firstActive?.id ?? ''
      }
    }).afterClosed().subscribe(result => {
      if (result?.published?.length) this.load();
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(DeploymentModalComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      disableClose: false,
      data: { applicationId: this.data.applicationId }
    });
    ref.afterClosed().subscribe(() => this.load());
  }

  close(): void {
    this.dialogRef.close();
  }

  statusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':   return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'READY':    return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'BUILDING': return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
      case 'PENDING':  return 'border-slate-500/30 bg-slate-500/10 text-slate-400';
      case 'FAILED':   return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'EXPIRED':  return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400';
      case 'TRASHED':  return 'border-zinc-500/30 bg-zinc-500/15 text-zinc-300';
      default:         return 'border-slate-500/30 bg-slate-500/10 text-slate-400';
    }
  }
}

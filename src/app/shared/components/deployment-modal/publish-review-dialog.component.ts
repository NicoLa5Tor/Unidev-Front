import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeploymentService } from '../../services/deployment.service';
import { UiToastService } from '../../services/ui-toast.service';
import { Deployment } from '../../models/deployment.model';

interface PublishDialogData {
  applicationId: number;
  /** Pre-selected deployment (the one the student clicked "Publicar" on) */
  preselectedId: string;
}

interface PublishItem {
  deployment: Deployment;
  selected: boolean;
  description: string;
  activating: boolean;
}

@Component({
  selector: 'app-publish-review-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish-review-dialog.component.html'
})
export class PublishReviewDialogComponent implements OnInit {
  private readonly deploymentService = inject(DeploymentService);
  private readonly dialogRef = inject(MatDialogRef<PublishReviewDialogComponent>);
  private readonly toast = inject(UiToastService);

  items: PublishItem[] = [];
  isLoading = true;
  isSubmitting = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PublishDialogData) {}

  ngOnInit(): void {
    this.deploymentService.listByApplication(this.data.applicationId).subscribe({
      next: deps => {
        this.items = deps
          .filter(d => (d.status === 'READY' || d.status === 'ACTIVE') && !d.publishedAt)
          .map(d => ({
            deployment: d,
            selected: d.status === 'ACTIVE' && d.id === this.data.preselectedId,
            description: '',
            activating: false
          }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get selectedCount(): number {
    return this.items.filter(i => i.selected).length;
  }

  get canSubmit(): boolean {
    return !this.isSubmitting && this.selectedCount > 0
      && this.items.filter(i => i.selected).every(i => i.description.trim().length > 0);
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.isSubmitting = true;
    const payload = this.items
      .filter(i => i.selected)
      .map(i => ({ id: i.deployment.id, description: i.description.trim() }));

    this.deploymentService.batchPublish(payload).subscribe({
      next: published => {
        this.isSubmitting = false;
        this.toast.success('Publicado para revisión. La empresa fue notificada.');
        this.dialogRef.close({ published });
      },
      error: err => {
        this.isSubmitting = false;
        this.toast.error(err?.error?.message ?? 'No se pudo publicar');
      }
    });
  }

  activateItem(item: PublishItem): void {
    if (item.activating) return;
    item.activating = true;
    this.deploymentService.activate(item.deployment.id).subscribe({
      next: updated => {
        item.deployment = updated;
        item.activating = false;
        item.selected = true;
        this.toast.success('Activado. Ahora puedes incluirlo en la revisión.');
      },
      error: err => {
        item.activating = false;
        this.toast.error(err?.error?.message ?? 'No se pudo activar');
      }
    });
  }

  statusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Listo';
  }

  statusColor(status: string): string {
    return status === 'ACTIVE'
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  }

  close(): void {
    this.dialogRef.close();
  }
}

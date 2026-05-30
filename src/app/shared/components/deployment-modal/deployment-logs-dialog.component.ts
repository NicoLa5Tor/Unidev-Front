import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, timer, switchMap } from 'rxjs';
import { DeploymentService } from '../../services/deployment.service';
import { Deployment } from '../../models/deployment.model';
import { UiToastService } from '../../services/ui-toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface LogsDialogData {
  deploymentId: string;
}

@Component({
  selector: 'app-deployment-logs-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployment-logs-dialog.component.html'
})
export class DeploymentLogsDialogComponent implements OnInit, OnDestroy {
  private readonly deploymentService = inject(DeploymentService);
  private readonly dialogRef = inject(MatDialogRef<DeploymentLogsDialogComponent>);
  private readonly toast = inject(UiToastService);
  private readonly dialog = inject(MatDialog);

  deployment: Deployment | null = null;
  isLoading = true;
  isDeleting = false;
  expandedPhases = new Set<string>();
  private pollSub: Subscription | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: LogsDialogData) {}

  ngOnInit(): void {
    this.fetch();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private fetch(): void {
    this.deploymentService.status(this.data.deploymentId).subscribe({
      next: d => {
        this.deployment = d;
        this.isLoading = false;
        // Auto-expandir fases FAILED y la RUNNING activa
        d.phases?.forEach(p => {
          if (p.status === 'FAILED' || p.status === 'RUNNING') {
            this.expandedPhases.add(p.name);
          }
        });
        if (d.status === 'PENDING' || d.status === 'BUILDING') {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('No se pudo obtener el deployment');
      }
    });
  }

  togglePhase(name: string): void {
    if (this.expandedPhases.has(name)) {
      this.expandedPhases.delete(name);
    } else {
      this.expandedPhases.add(name);
    }
  }

  isExpanded(name: string): boolean {
    return this.expandedPhases.has(name);
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = timer(3000, 3000)
      .pipe(switchMap(() => this.deploymentService.status(this.data.deploymentId)))
      .subscribe({
        next: d => {
          this.deployment = d;
          d.phases?.forEach(p => {
            if (p.status === 'FAILED' || p.status === 'RUNNING') {
              this.expandedPhases.add(p.name);
            }
          });
          if (d.status !== 'PENDING' && d.status !== 'BUILDING') {
            this.stopPolling();
          }
        },
        error: () => this.stopPolling()
      });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  get isTrashed(): boolean {
    return this.deployment?.status === 'TRASHED';
  }

  delete(): void {
    if (!this.deployment || this.isDeleting) return;
    const trashed = this.isTrashed;
    const data = trashed
      ? {
          title: 'Eliminar definitivamente',
          message: 'El registro y los logs se perderán para siempre. Esta acción no se puede deshacer.',
          confirmLabel: 'Eliminar',
          variant: 'danger' as const
        }
      : {
          title: 'Enviar a la papelera',
          message: 'Se detendrán los contenedores y el subdominio quedará disponible. Podrás revisar los logs después en la papelera.',
          confirmLabel: 'Enviar a papelera',
          variant: 'danger' as const
        };
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.isDeleting = true;
      const obs = trashed
        ? this.deploymentService.permanentDelete(this.deployment!.id)
        : this.deploymentService.delete(this.deployment!.id);
      obs.subscribe({
        next: () => {
          this.isDeleting = false;
          this.toast.success(trashed ? 'Deployment eliminado definitivamente' : 'Deployment enviado a la papelera');
          this.dialogRef.close({ deleted: true });
        },
        error: () => {
          this.isDeleting = false;
          this.toast.error('No se pudo eliminar el deployment');
        }
      });
    });
  }

  activate(): void {
    if (!this.deployment) return;
    this.deploymentService.activate(this.deployment.id).subscribe({
      next: d => {
        this.deployment = d;
        this.toast.success('Deployment activado');
      },
      error: () => this.toast.error('No se pudo activar el deployment')
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  statusColor(status: string | undefined): string {
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

  phaseColor(status: string | undefined): string {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'RUNNING': return 'text-sky-400';
      case 'FAILED':  return 'text-red-400';
      case 'SKIPPED': return 'text-zinc-500';
      default:        return 'text-slate-500';
    }
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-CO');
  }
}

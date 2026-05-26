import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeploymentInfoDialogComponent } from './deployment-info-dialog.component';
import { GithubTokenGuideDialogComponent } from './github-token-guide-dialog.component';
import { Subject, of, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { DeploymentService } from '../../services/deployment.service';
import { UiToastService } from '../../services/ui-toast.service';
import { Deployment, DeploymentPhase, PhaseStatus, SubdomainStatus } from '../../models/deployment.model';

type WizardStep = 'form' | 'building' | 'ready' | 'active' | 'failed';

@Component({
  selector: 'app-deployment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deployment-modal.component.html'
})
export class DeploymentModalComponent implements OnInit, OnDestroy {
  private readonly deploymentService = inject(DeploymentService);
  private readonly toast = inject(UiToastService);
  private readonly dialogRef = inject(MatDialogRef<DeploymentModalComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly data = inject<{ applicationId: number }>(MAT_DIALOG_DATA);

  step: WizardStep = 'form';

  repoUrl = '';
  gitToken = '';
  subdomain = '';
  containerPort: number | null = null;
  envFile: File | null = null;

  subdomainStatus: SubdomainStatus | 'CHECKING' | null = null;
  subdomainError: string | null = null;
  private readonly subdomainCheck$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  isSubmitting = false;
  deployment: Deployment | null = null;
  isActivating = false;

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  expandedPhases = new Set<string>();

  // Phases the user scrolled UP in. Default behaviour is sticky-bottom (tail).
  // Once the user moves away from the bottom, we stop auto-scrolling that phase
  // until they scroll back down.
  private readonly unstuckPhases = new Set<string>();

  trackPhase(_index: number, phase: DeploymentPhase): string {
    return phase.name;
  }

  onLogScroll(phaseName: string, el: HTMLElement): void {
    const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (distanceFromBottom < 24) this.unstuckPhases.delete(phaseName);
    else this.unstuckPhases.add(phaseName);
  }

  private scrollStickyLogsToBottom(): void {
    document.querySelectorAll<HTMLElement>('pre[data-phase]').forEach(el => {
      const phase = el.dataset['phase'];
      if (!phase || this.unstuckPhases.has(phase)) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  phaseClasses(status: PhaseStatus): { bullet: string; text: string; border: string } {
    switch (status) {
      case 'RUNNING':
        return { bullet: 'bg-sky-400 ring-4 ring-sky-400/30 animate-pulse', text: 'text-sky-400', border: 'border-sky-500/30 bg-sky-500/5' };
      case 'SUCCESS':
        return { bullet: 'bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5' };
      case 'FAILED':
        return { bullet: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40 bg-rose-500/10' };
      case 'SKIPPED':
        return { bullet: 'bg-[var(--muted)]/40', text: 'text-[var(--muted)]', border: 'border-[color:var(--panel-border)] bg-[var(--panel-2)]' };
      default:
        return { bullet: 'bg-[var(--muted)]/30', text: 'text-[var(--muted)]', border: 'border-[color:var(--panel-border)] bg-[var(--panel-2)]' };
    }
  }

  openInfoDialog(): void {
    this.dialog.open(DeploymentInfoDialogComponent, {
      width: '640px', maxWidth: '96vw', maxHeight: '90vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop'
    });
  }

  openTokenGuideDialog(): void {
    this.dialog.open(GithubTokenGuideDialogComponent, {
      width: '640px', maxWidth: '96vw', maxHeight: '90vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop'
    });
  }

  togglePhase(name: string): void {
    if (this.expandedPhases.has(name)) this.expandedPhases.delete(name);
    else this.expandedPhases.add(name);
  }

  phaseDuration(p: DeploymentPhase): string | null {
    if (!p.startedAt) return null;
    const end = p.finishedAt ? new Date(p.finishedAt).getTime() : Date.now();
    const start = new Date(p.startedAt).getTime();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return seconds + 's';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + 'm ' + s + 's';
  }

  ngOnInit(): void {
    this.subdomainCheck$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(value => {
          const v = (value || '').toLowerCase().trim();
          if (!v) {
            this.subdomainStatus = null;
            this.subdomainError = null;
            return of(null);
          }
          if (!/^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/.test(v)) {
            this.subdomainStatus = 'RESERVED';
            this.subdomainError = 'Formato inválido. Use entre 3 y 30 caracteres: letras minúsculas, números y guiones (no al inicio ni al final).';
            return of(null);
          }
          this.subdomainStatus = 'CHECKING';
          this.subdomainError = null;
          return this.deploymentService.checkSubdomain(v).pipe(catchError(() => of(null)));
        })
      )
      .subscribe(res => {
        if (!res) return;
        this.subdomainStatus = res.status;
        this.subdomainError = res.status === 'AVAILABLE' ? null
          : res.status === 'RESERVED' ? 'Este subdominio está reservado por la plataforma.'
          : 'Este subdominio ya está en uso.';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
  }

  onSubdomainInput(value: string): void {
    this.subdomain = value;
    this.subdomainCheck$.next(value);
  }

  onEnvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      this.envFile = null;
      return;
    }
    if (file.size > 64 * 1024) {
      this.toast.error('El archivo .env es demasiado grande (máximo 64 KB).');
      input.value = '';
      return;
    }
    this.envFile = file;
  }

  get canSubmit(): boolean {
    return !this.isSubmitting
      && !!this.repoUrl.trim()
      && !!this.envFile
      && (this.subdomain.trim() === '' || this.subdomainStatus === 'AVAILABLE');
  }

  submit(): void {
    if (!this.canSubmit || !this.envFile) return;
    this.isSubmitting = true;

    const form = new FormData();
    form.append('repoUrl', this.repoUrl.trim());
    if (this.gitToken.trim()) form.append('gitToken', this.gitToken.trim());
    if (this.subdomain.trim()) form.append('subdomain', this.subdomain.trim().toLowerCase());
    form.append('applicationId', String(this.data.applicationId));
    if (this.containerPort != null && this.containerPort > 0) {
      form.append('port', String(this.containerPort));
    }
    form.append('envFile', this.envFile);

    this.deploymentService.create(form).subscribe({
      next: deployment => {
        this.isSubmitting = false;
        this.deployment = deployment;
        this.step = 'building';
        this.startPolling(deployment.id);
      },
      error: err => {
        this.isSubmitting = false;
        const status = err?.status;
        const msg = err?.error?.message ?? err?.error ?? '';
        if (status === 409 && typeof msg === 'string' && msg.toLowerCase().includes('subdominio')) {
          this.toast.error('El subdominio ya está en uso. Por favor escoja otro.');
          this.subdomainStatus = 'IN_USE';
          return;
        }
        this.toast.error(typeof msg === 'string' && msg ? msg : 'No se pudo crear el despliegue.');
      }
    });
  }

  activate(): void {
    if (!this.deployment || this.isActivating) return;
    this.isActivating = true;
    this.deploymentService.activate(this.deployment.id).subscribe({
      next: updated => {
        this.isActivating = false;
        this.deployment = updated;
        this.step = 'active';
        this.stopPolling();
        this.toast.success('Despliegue activado correctamente.');
      },
      error: err => {
        this.isActivating = false;
        this.toast.error(err?.error?.message ?? 'No se pudo activar el despliegue.');
      }
    });
  }

  cancelDeployment(): void {
    if (!this.deployment) {
      this.dialogRef.close();
      return;
    }
    this.deploymentService.delete(this.deployment.id).subscribe({
      next: () => this.dialogRef.close(this.deployment),
      error: () => this.dialogRef.close(this.deployment)
    });
  }

  close(): void {
    this.dialogRef.close(this.deployment);
  }

  copyUrl(): void {
    if (!this.deployment) return;
    navigator.clipboard.writeText(this.deployment.url).then(
      () => this.toast.success('URL copiada al portapapeles.'),
      () => this.toast.error('No se pudo copiar la URL.')
    );
  }

  private startPolling(id: string): void {
    this.stopPolling();
    this.pollHandle = setInterval(() => {
      this.deploymentService.status(id).subscribe({
        next: d => {
          this.deployment = d;
          // Auto-expand the running phase so the user sees fresh logs
          const running = d.phases?.find(p => p.status === 'RUNNING');
          if (running) this.expandedPhases.add(running.name);
          if (d.status === 'READY') { this.step = 'ready'; this.stopPolling(); }
          else if (d.status === 'FAILED') {
            this.step = 'failed';
            // Auto-expand the failed phase
            const failed = d.phases?.find(p => p.status === 'FAILED');
            if (failed) this.expandedPhases.add(failed.name);
            this.stopPolling();
          }
          else if (d.status === 'ACTIVE') { this.step = 'active'; this.stopPolling(); }
          // After change detection paints the new logs, scroll sticky boxes to bottom
          setTimeout(() => this.scrollStickyLogsToBottom(), 0);
        },
        error: () => {}
      });
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollHandle != null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }
}

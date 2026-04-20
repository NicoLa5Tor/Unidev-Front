import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ProjectService } from '../../services/project.service';
import {
  ProjectDetail,
  ProjectRequirement,
  UpdateProjectRequirementDto
} from '../../../../shared/models/project.model';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { RequirementAssistantDialogComponent } from '../requirement-assistant-dialog/requirement-assistant-dialog.component';

type RequirementDraft = {
  title: string;
  description: string;
  priority: string;
  involvedUser: string;
  hasExternalConnection: boolean;
  requiresVisualScreen: boolean;
  active: boolean;
  devNumber: string;
};

export interface ProjectDetailDialogData {
  projectId: number;
}

@Component({
  selector: 'app-project-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './project-detail-dialog.component.html',
  styleUrl: './project-detail-dialog.component.scss'
})
export class ProjectDetailDialogComponent implements OnDestroy {
  private static readonly POLL_INTERVAL_MS = 3000;
  isLoading = true;
  updatingRequirementId: number | null = null;
  retryingAi = false;
  project: ProjectDetail | null = null;
  private requirementDrafts: Record<number, RequirementDraft> = {};
  private pollHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly dialog = inject(MatDialog);

  constructor(
    private readonly dialogRef: MatDialogRef<ProjectDetailDialogComponent, ProjectDetail | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: ProjectDetailDialogData,
    private readonly projectService: ProjectService,
    private readonly uiToastService: UiToastService
  ) {
    this.loadProject();
  }

  get requirements(): ProjectRequirement[] {
    return this.project?.requirements ?? [];
  }

  get activeRequirementsCount(): number {
    return this.requirements.filter(requirement => requirement.active).length;
  }

  get statusLabel(): string {
    if (!this.project) {
      return 'Sin seleccionar';
    }
    if (this.project.estimationStatus === 'FAILED') {
      return 'Estimacion con fallo';
    }
    if (this.project.estimationStatus === 'PENDING') {
      return 'Estimacion en curso';
    }
    if (this.project.requirementsStatus === 'PENDING') {
      return 'Requerimientos en curso';
    }
    return this.project.statusCode;
  }

  get quoteStatusLabel(): string {
    if (!this.project) {
      return 'Sin cotizacion';
    }
    if (this.project.quote?.available) {
      return 'Rango listo';
    }
    if (this.project.estimationStatus === 'PENDING') {
      return 'Cotizando';
    }
    return 'No disponible';
  }

  close(): void {
    this.stopPolling();
    this.dialogRef.close(this.project);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  getRequirementDraft(requirement: ProjectRequirement): RequirementDraft {
    return this.requirementDrafts[requirement.id] ?? this.createRequirementDraft(requirement);
  }

  saveRequirement(requirement: ProjectRequirement): void {
    if (!this.project || this.updatingRequirementId === requirement.id) {
      return;
    }

    const draft = this.getRequirementDraft(requirement);
    if (!draft.title.trim()) {
      this.uiToastService.error('El requerimiento debe tener un titulo.');
      return;
    }

    const devNumber = Number(draft.devNumber);
    if (!Number.isFinite(devNumber) || devNumber < 1) {
      this.uiToastService.error('El numero de desarrolladores debe ser al menos 1.');
      return;
    }

    const payload: UpdateProjectRequirementDto = {
      title: draft.title.trim(),
      description: this.toNullable(draft.description),
      priority: this.toNullable(draft.priority),
      involvedUser: this.toNullable(draft.involvedUser),
      hasExternalConnection: draft.hasExternalConnection,
      requiresVisualScreen: draft.requiresVisualScreen,
      active: draft.active,
      devNumber
    };

    this.updatingRequirementId = requirement.id;
    this.projectService.updateRequirement(this.project.id, requirement.id, payload).subscribe({
      next: project => {
        this.project = project;
        this.seedRequirementDrafts(project.requirements);
        this.updatingRequirementId = null;
        this.uiToastService.success('Requerimiento actualizado. La reestimacion ya fue disparada.');
      },
      error: error => {
        this.updatingRequirementId = null;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar el requerimiento.'));
      }
    });
  }

  openRequirementAssistant(requirement: ProjectRequirement): void {
    if (!this.project || !requirement.active) {
      return;
    }

    this.dialog
      .open(RequirementAssistantDialogComponent, {
        width: '920px',
        maxWidth: '94vw',
        maxHeight: '92vh',
        panelClass: 'app-shell-dialog-panel',
        backdropClass: 'app-shell-dialog-backdrop',
        data: {
          projectId: this.project.id,
          requirement
        }
      })
      .afterClosed()
      .subscribe((project: ProjectDetail | null | undefined) => {
        if (!project) {
          return;
        }
        this.project = project;
        this.seedRequirementDrafts(project.requirements);
        this.syncPolling(project);
      });
  }

  toggleRequirementActivation(requirement: ProjectRequirement, active: boolean): void {
    if (!this.project || this.updatingRequirementId === requirement.id) {
      return;
    }

    const draft = this.getRequirementDraft(requirement);
    if (!active && this.activeRequirementsCount <= 1 && requirement.active) {
      this.uiToastService.error('Debe quedar al menos un requerimiento activo para estimar el proyecto.');
      return;
    }

    draft.active = active;
    this.saveRequirement(requirement);
  }

  retryAiPipeline(): void {
    if (!this.project || this.retryingAi) {
      return;
    }

    this.retryingAi = true;
    this.projectService.retryAi(this.project.id).subscribe({
      next: project => {
        this.project = project;
        this.seedRequirementDrafts(project.requirements);
        this.retryingAi = false;
        this.uiToastService.success('Reintentamos el pipeline de IA para este proyecto.');
      },
      error: error => {
        this.retryingAi = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos reintentar la IA para este proyecto.'));
      }
    });
  }

  projectStatusTone(project: ProjectDetail | null): string {
    if (!project) {
      return 'border-[color:var(--panel-border)] bg-[var(--panel-2)] text-[var(--muted)]';
    }

    if (project.estimationStatus === 'FAILED' || project.requirementsStatus === 'FAILED') {
      return 'app-status-danger';
    }

    if (project.estimationStatus === 'PENDING' || project.requirementsStatus === 'PENDING') {
      return 'app-status-warning';
    }

    return 'app-status-success';
  }

  quoteStatusTone(project: ProjectDetail | null): string {
    if (!project) {
      return 'border-[color:var(--panel-border)] bg-[var(--panel-2)] text-[var(--muted)]';
    }
    if (project.estimationStatus === 'FAILED' || project.requirementsStatus === 'FAILED') {
      return 'app-status-danger';
    }
    if (project.quote?.available) {
      return 'app-status-success';
    }
    return 'app-status-warning';
  }

  formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    if (amount == null || !Number.isFinite(amount)) {
      return 'Pendiente';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private loadProject(): void {
    this.isLoading = true;
    this.projectService.getProject(this.data.projectId).subscribe({
      next: project => {
        this.project = project;
        this.seedRequirementDrafts(project.requirements);
        this.isLoading = false;
        this.syncPolling(project);
      },
      error: error => {
        this.isLoading = false;
        this.stopPolling();
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar el detalle del proyecto.'));
        this.dialogRef.close(null);
      }
    });
  }

  private seedRequirementDrafts(requirements: ProjectRequirement[]): void {
    this.requirementDrafts = requirements.reduce<Record<number, RequirementDraft>>((acc, requirement) => {
      acc[requirement.id] = this.createRequirementDraft(requirement);
      return acc;
    }, {});
  }

  private createRequirementDraft(requirement: ProjectRequirement): RequirementDraft {
    const draft: RequirementDraft = {
      title: requirement.title ?? '',
      description: requirement.description ?? '',
      priority: requirement.priority ?? '',
      involvedUser: requirement.involvedUser ?? '',
      hasExternalConnection: !!requirement.hasExternalConnection,
      requiresVisualScreen: !!requirement.requiresVisualScreen,
      active: requirement.active !== false,
      devNumber: String(requirement.devNumber ?? 1)
    };

    this.requirementDrafts[requirement.id] = draft;
    return draft;
  }

  private toNullable(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: string }; message?: string })?.error?.message
      ?? (error as { message?: string })?.message;

    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  private shouldPoll(project: ProjectDetail | null): boolean {
    if (!project) {
      return false;
    }
    return project.requirementsStatus === 'PENDING' || project.estimationStatus === 'PENDING';
  }

  private syncPolling(project: ProjectDetail | null): void {
    if (!this.shouldPoll(project)) {
      this.stopPolling();
      return;
    }
    this.schedulePoll();
  }

  private schedulePoll(): void {
    this.stopPolling();
    this.pollHandle = setTimeout(() => {
      this.projectService.getProject(this.data.projectId).subscribe({
        next: project => {
          this.project = project;
          this.seedRequirementDrafts(project.requirements);
          this.syncPolling(project);
        },
        error: () => {
          this.stopPolling();
        }
      });
    }, ProjectDetailDialogComponent.POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollHandle) {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    }
  }
}

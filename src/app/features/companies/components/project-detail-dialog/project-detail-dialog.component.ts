import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ProjectService } from '../../services/project.service';
import { ProjectDetail, ProjectRequirement, UpdateProjectRequirementDto } from '../../../../shared/models/project.model';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

type RequirementDraft = {
  title: string;
  description: string;
  priority: string;
  involvedUser: string;
  hasExternalConnection: boolean;
  requiresVisualScreen: boolean;
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
export class ProjectDetailDialogComponent {
  isLoading = true;
  updatingRequirementId: number | null = null;
  project: ProjectDetail | null = null;
  private requirementDrafts: Record<number, RequirementDraft> = {};

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

  close(): void {
    this.dialogRef.close(this.project);
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

  private loadProject(): void {
    this.isLoading = true;
    this.projectService.getProject(this.data.projectId).subscribe({
      next: project => {
        this.project = project;
        this.seedRequirementDrafts(project.requirements);
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
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
}

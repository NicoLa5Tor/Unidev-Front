import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import {
  ProjectDetail,
  ProjectPublishRequest,
  ProjectRequirement
} from '../../../../shared/models/project.model';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { RequirementAssistantDialogComponent } from '../requirement-assistant-dialog/requirement-assistant-dialog.component';

export interface ProjectDetailDialogData {
  projectId: number;
}

@Component({
  selector: 'app-project-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './project-detail-dialog.component.html',
  styleUrl: './project-detail-dialog.component.scss'
})
export class ProjectDetailDialogComponent implements OnDestroy {
  private static readonly POLL_INTERVAL_MS = 2000;
  isLoading = true;
  updatingRequirementId: number | null = null;
  retryingAi = false;
  publishingProject = false;
  project: ProjectDetail | null = null;

  // Flujo de aprobación de precio
  showPriceApprovalModal = false;
  priceDecision: 'agreed' | 'custom' | null = null;
  customPriceMin: number | null = null;
  customPriceMax: number | null = null;
  customPriceCurrency = 'COP';

  // Info panels en modal de precio
  infoOpen: Record<string, boolean> = {};
  toggleInfo(key: string): void {
    this.infoOpen[key] = !this.infoOpen[key];
  }

  private expandedRequirementIds = new Set<number>();
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

  get isPublished(): boolean {
    return !!this.project?.publishedAt || this.project?.statusCode === 'PUBLISHED';
  }

  get canPublish(): boolean {
    if (!this.project || this.isPublished) {
      return false;
    }
    return this.project.requirementsStatus === 'COMPLETED'
      && this.project.estimationStatus === 'COMPLETED';
  }

  close(): void {
    this.stopPolling();
    this.dialogRef.close(this.project);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  requirementLabel(requirement: ProjectRequirement): string {
    const index = this.requirements.findIndex(item => item.id === requirement.id);
    return index >= 0 ? `Requerimiento ${index + 1}` : 'Requerimiento';
  }

  isRequirementExpanded(requirement: ProjectRequirement): boolean {
    return this.expandedRequirementIds.has(requirement.id);
  }

  toggleRequirementExpansion(requirement: ProjectRequirement): void {
    if (this.isRequirementExpanded(requirement)) {
      this.expandedRequirementIds.delete(requirement.id);
      return;
    }
    this.expandedRequirementIds.add(requirement.id);
  }

  openRequirementAssistant(requirement: ProjectRequirement): void {
    if (!this.project || !requirement.active || this.isPublished) {
      return;
    }

    const requirementIndex = this.requirements.findIndex(item => item.id === requirement.id);

    this.dialog
      .open(RequirementAssistantDialogComponent, {
        width: '920px',
        maxWidth: '94vw',
        maxHeight: '92vh',
        panelClass: 'app-shell-dialog-panel',
        backdropClass: 'app-shell-dialog-backdrop',
        data: {
          projectId: this.project.id,
          requirement,
          requirementIndex
        }
      })
      .afterClosed()
      .subscribe((project: ProjectDetail | null | undefined) => {
        if (!project) {
          return;
        }
        this.project = project;
        this.ensureExpandedRequirements(project.requirements);
        this.syncPolling(project);
      });
  }

  toggleRequirementActivation(requirement: ProjectRequirement, active: boolean): void {
    if (!this.project || this.updatingRequirementId === requirement.id || this.isPublished) {
      return;
    }

    if (!active && this.activeRequirementsCount <= 1 && requirement.active) {
      this.uiToastService.error('Debe quedar al menos un requerimiento activo para estimar el proyecto.');
      return;
    }

    this.updatingRequirementId = requirement.id;
    this.projectService.updateRequirement(this.project.id, requirement.id, {
      title: requirement.title,
      description: requirement.description,
      priority: requirement.priority,
      involvedUser: requirement.involvedUser,
      hasExternalConnection: requirement.hasExternalConnection,
      requiresVisualScreen: requirement.requiresVisualScreen,
      active,
      devNumber: requirement.devNumber ?? 1
    }).subscribe({
      next: project => {
        this.project = project;
        this.ensureExpandedRequirements(project.requirements);
        this.updatingRequirementId = null;
        this.syncPolling(project);
        this.uiToastService.success(active ? 'Requerimiento reactivado.' : 'Requerimiento excluido del estimado actual.');
      },
      error: error => {
        this.updatingRequirementId = null;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar el estado del requerimiento.'));
      }
    });
  }

  retryAiPipeline(): void {
    if (!this.project || this.retryingAi || this.isPublished) {
      return;
    }

    this.retryingAi = true;
    this.projectService.retryAi(this.project.id).subscribe({
      next: project => {
        this.project = project;
        this.ensureExpandedRequirements(project.requirements);
        this.retryingAi = false;
        this.syncPolling(project);
        this.uiToastService.success('Reintentamos el pipeline de IA para este proyecto.');
      },
      error: error => {
        this.retryingAi = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos reintentar la IA para este proyecto.'));
      }
    });
  }

  openPriceApproval(): void {
    if (!this.project || this.publishingProject || !this.canPublish) {
      return;
    }
    this.priceDecision = null;
    this.customPriceMin = null;
    this.customPriceMax = null;
    this.customPriceCurrency = this.project.quote?.currency || 'COP';
    this.showPriceApprovalModal = true;
  }

  closePriceApproval(): void {
    this.showPriceApprovalModal = false;
  }

  confirmPriceAndPublish(): void {
    if (!this.project || !this.priceDecision) {
      return;
    }

    if (this.priceDecision === 'custom') {
      if (!this.customPriceMin || !this.customPriceMax) {
        this.uiToastService.error('Ingresa el rango de precio mínimo y máximo.');
        return;
      }
      if (this.customPriceMin <= 0 || this.customPriceMax <= 0) {
        this.uiToastService.error('Los precios deben ser mayores a cero.');
        return;
      }
      if (this.customPriceMin > this.customPriceMax) {
        this.uiToastService.error('El precio mínimo no puede ser mayor al máximo.');
        return;
      }
    }

    const payload: ProjectPublishRequest = this.priceDecision === 'agreed'
      ? { agreedToSuggestedPrice: true }
      : {
          agreedToSuggestedPrice: false,
          customMinAmount: this.customPriceMin,
          customMaxAmount: this.customPriceMax,
          currency: this.customPriceCurrency
        };

    this.showPriceApprovalModal = false;
    this.publishingProject = true;

    this.projectService.publishProject(this.project.id, payload).subscribe({
      next: project => {
        this.project = project;
        this.ensureExpandedRequirements(project.requirements);
        this.publishingProject = false;
        this.uiToastService.success('Proyecto publicado. Ya no admite cambios.');
      },
      error: error => {
        this.publishingProject = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos publicar el proyecto.'));
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
        this.ensureExpandedRequirements(project.requirements);
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
          this.ensureExpandedRequirements(project.requirements);
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

  private ensureExpandedRequirements(requirements: ProjectRequirement[]): void {
    const currentIds = new Set(requirements.map(requirement => requirement.id));
    this.expandedRequirementIds.forEach(id => {
      if (!currentIds.has(id)) {
        this.expandedRequirementIds.delete(id);
      }
    });

    if (!requirements.length || this.expandedRequirementIds.size > 0) {
      return;
    }

    this.expandedRequirementIds.add(requirements[0].id);
  }
}

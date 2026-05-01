import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ApplicationService } from '../../services/application.service';
import { StudentService } from '../../../universities/services/student.service';
import {
  ProjectDetail,
  ProjectPublishRequest,
  ProjectRequirement
} from '../../../../shared/models/project.model';
import { ApplicantProfile, ProjectApplication } from '../../../../shared/models/project-application.model';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { RequirementAssistantDialogComponent } from '../requirement-assistant-dialog/requirement-assistant-dialog.component';
import { ApplicationNegotiationDialogComponent } from '../../../../shared/components/application-negotiation-dialog/application-negotiation-dialog.component';

export type ProjectDetailSection = 'detail' | 'applications';

export interface ProjectDetailDialogData {
  projectId: number;
  initialSection?: ProjectDetailSection;
  viewerMode?: 'company' | 'student';
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

  // Sección activa: detalle o postulaciones
  activeSection: ProjectDetailSection = 'detail';
  applications: ProjectApplication[] = [];
  applicationsLoading = false;
  updatingApplicationId: number | null = null;
  applicationSearch = '';
  applicationStatusFilter: 'ALL' | 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' = 'ALL';
  availabilityFilter: 'ALL' | 'AVAILABLE' | 'UNAVAILABLE' = 'ALL';
  requiredSkill = '';
  minimumAcceptedProjects = 0;
  selectedApplicationId: number | null = null;
  selectedApplicantProfile: ApplicantProfile | null = null;
  applicantProfileLoading = false;

  // Flujo de aprobación de precio
  showPriceApprovalModal = false;
  showCompanyProfileModal = false;
  priceDecision: 'agreed' | 'custom' | null = null;
  customPriceAmount: number | null = null;

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
    private readonly applicationService: ApplicationService,
    private readonly studentService: StudentService,
    private readonly uiToastService: UiToastService
  ) {
    this.activeSection = data.initialSection ?? 'detail';
    this.loadProject();
  }

  get requirements(): ProjectRequirement[] {
    return this.project?.requirements ?? [];
  }

  get viewerMode(): 'company' | 'student' {
    return this.data.viewerMode ?? 'company';
  }

  get isStudentView(): boolean {
    return this.viewerMode === 'student';
  }

  get isReadOnlyView(): boolean {
    return this.isStudentView;
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
    switch (this.project.statusCode) {
      case 'PUBLISHED':
        return 'Publicado';
      case 'IN_PROGRESS':
        return 'En desarrollo';
      case 'CLOSED':
        return 'Cerrado';
      case 'READY':
        return 'Listo';
      default:
        return 'En edicion';
    }
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
    return this.project?.statusCode === 'PUBLISHED';
  }

  get isLocked(): boolean {
    const status = this.project?.statusCode;
    return status === 'PUBLISHED' || status === 'IN_PROGRESS' || status === 'CLOSED';
  }

  get isInDevelopment(): boolean {
    return this.project?.statusCode === 'IN_PROGRESS';
  }

  get canPublish(): boolean {
    if (!this.project || this.isLocked || this.isReadOnlyView) {
      return false;
    }
    return this.project.requirementsStatus === 'COMPLETED'
      && this.project.estimationStatus === 'COMPLETED';
  }

  get filteredApplications(): ProjectApplication[] {
    const query = this.applicationSearch.trim().toLowerCase();

    return this.applications.filter(app => {
      if (this.applicationStatusFilter !== 'ALL' && app.status !== this.applicationStatusFilter) {
        return false;
      }

      if (this.availabilityFilter === 'AVAILABLE' && app.applicantAvailableForProjects !== true) {
        return false;
      }

      if (this.availabilityFilter === 'UNAVAILABLE' && app.applicantAvailableForProjects !== false) {
        return false;
      }

      if ((app.acceptedProjectsCount ?? 0) < this.minimumAcceptedProjects) {
        return false;
      }

      const skillQuery = this.requiredSkill.trim().toLowerCase();
      if (skillQuery) {
        const skills = (app.applicantSkills ?? '').toLowerCase();
        if (!skills.includes(skillQuery)) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      const haystack = [
        app.applicantDisplayName,
        app.applicantEmail,
        app.applicantCareer,
        app.applicantSkills,
        app.applicantCity,
        app.teamName,
        app.teamDescription,
        app.applicantBio,
        app.message
      ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  close(): void {
    this.stopPolling();
    this.dialogRef.close(this.project);
  }

  openCompanyProfile(): void {
    if (!this.project || !this.isStudentView) {
      return;
    }
    this.showCompanyProfileModal = true;
  }

  closeCompanyProfile(): void {
    this.showCompanyProfileModal = false;
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
    if (!this.project || !requirement.active || this.isLocked) {
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
    if (!this.project || this.updatingRequirementId === requirement.id || this.isLocked) {
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
    if (!this.project || this.retryingAi || this.isLocked) {
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
    this.customPriceAmount = null;
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
      if (!this.customPriceAmount) {
        this.uiToastService.error('Ingresa el precio que deseas publicar.');
        return;
      }
      if (this.customPriceAmount <= 0) {
        this.uiToastService.error('Los precios deben ser mayores a cero.');
        return;
      }
    }

    const payload: ProjectPublishRequest = this.priceDecision === 'agreed'
      ? { agreedToSuggestedPrice: true }
      : {
          agreedToSuggestedPrice: false,
          customAmount: this.customPriceAmount
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

  switchSection(section: ProjectDetailSection): void {
    if (this.isStudentView && section === 'applications') {
      return;
    }
    this.activeSection = section;
    if (section === 'applications' && !this.applicationsLoading && this.applications.length === 0 && this.project) {
      this.loadApplications();
    }
  }

  applicationStatusLabel(app: ProjectApplication): string {
    switch (app.status) {
      case 'ACCEPTED': return 'Aceptado';
      case 'REJECTED': return 'Rechazado';
      case 'NEGOTIATING': return 'En negociación';
      default: return 'Pendiente';
    }
  }

  applicationStatusTone(app: ProjectApplication): string {
    switch (app.status) {
      case 'ACCEPTED': return 'app-status-success';
      case 'REJECTED': return 'app-status-danger';
      case 'NEGOTIATING': return 'app-status-info';
      default: return 'app-status-warning';
    }
  }

  isProfileOpenFor(app: ProjectApplication): boolean {
    return this.selectedApplicationId === app.id;
  }

  openApplicantProfile(app: ProjectApplication, event?: Event): void {
    event?.stopPropagation();
    if (!this.project) {
      return;
    }
    if (this.selectedApplicationId === app.id && this.selectedApplicantProfile) {
      return;
    }

    this.selectedApplicationId = app.id;
    this.selectedApplicantProfile = null;
    this.applicantProfileLoading = true;

    this.applicationService.getApplicantProfile(this.project.id, app.id).subscribe({
      next: profile => {
        this.selectedApplicantProfile = profile;
        this.applicantProfileLoading = false;
      },
      error: error => {
        this.applicantProfileLoading = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar el perfil del postulante.'));
      }
    });
  }

  closeApplicantProfile(): void {
    this.selectedApplicationId = null;
    this.selectedApplicantProfile = null;
    this.applicantProfileLoading = false;
  }

  openNegotiation(app: ProjectApplication, event?: Event): void {
    event?.stopPropagation();
    if (!this.project) {
      return;
    }
    this.dialog.open(ApplicationNegotiationDialogComponent, {
      width: '960px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: {
        viewerMode: 'company',
        projectId: this.project.id,
        applicationId: app.id
      }
    }).afterClosed().subscribe((result?: { hired?: boolean }) => {
      if (result?.hired) {
        // Reload project + applications to reflect IN_PROGRESS status and rejected apps
        this.loadProject();
        this.loadApplications();
      } else {
        // Refresh application statuses silently (student may have accepted while dialog was open)
        this.loadApplications();
      }
    });
  }

  applicantSkills(profile: ApplicantProfile | null): string[] {
    if (!profile?.skills) {
      return [];
    }
    return profile.skills.split(',').map(skill => skill.trim()).filter(Boolean);
  }

  applicationSkills(app: ProjectApplication): string[] {
    if (!app.applicantSkills) {
      return [];
    }
    return app.applicantSkills.split(',').map(skill => skill.trim()).filter(Boolean);
  }

  profileProjectStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'PUBLISHED': return 'Publicado';
      case 'IN_PROGRESS': return 'En desarrollo';
      case 'CLOSED': return 'Cerrado';
      case 'READY': return 'Listo';
      default: return 'Sin estado';
    }
  }

  updateApplicationStatus(app: ProjectApplication, status: 'ACCEPTED' | 'REJECTED', event?: Event): void {
    event?.stopPropagation();
    if (!this.project || this.updatingApplicationId === app.id) return;

    this.updatingApplicationId = app.id;
    this.applicationService.updateStatus(this.project.id, app.id, status).subscribe({
      next: () => {
        this.updatingApplicationId = null;
        const label = status === 'ACCEPTED' ? 'Postulación aceptada.' : 'Postulación rechazada.';
        this.loadProject();
        this.uiToastService.success(label);
      },
      error: error => {
        this.updatingApplicationId = null;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar el estado de la postulación.'));
      }
    });
  }

  private loadApplications(): void {
    if (!this.project) return;
    this.applicationsLoading = true;
    this.applicationService.listApplications(this.project.id).subscribe({
      next: apps => {
        this.applications = apps;
        if (this.selectedApplicationId && !apps.some(app => app.id === this.selectedApplicationId)) {
          this.closeApplicantProfile();
        }
        this.applicationsLoading = false;
      },
      error: error => {
        this.applicationsLoading = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar las postulaciones.'));
      }
    });
  }

  private loadProject(): void {
    this.isLoading = true;
    const request$ = this.isStudentView
      ? this.studentService.getPublishedProjectDetail(this.data.projectId)
      : this.projectService.getProject(this.data.projectId);

    request$.subscribe({
      next: project => {
        this.project = project;
        this.ensureExpandedRequirements(project.requirements);
        this.isLoading = false;
        this.syncPolling(project);
        if (this.activeSection === 'applications') {
          this.loadApplications();
        }
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
    if (this.isStudentView) {
      return false;
    }
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

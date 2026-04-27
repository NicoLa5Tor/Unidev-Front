import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { DashboardShellComponent, DashboardNavItem } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { StudentTeam, ProjectApplication } from '../../../../shared/models/student.model';
import { Project } from '../../../../shared/models/project.model';
import { SessionUser } from '../../../../shared/models/session-user.model';

@Component({
  selector: 'app-student-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './student-workspace.component.html'
})
export class StudentWorkspaceComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly userSessionService = inject(UserSessionService);
  private readonly toast = inject(UiToastService);

  currentUser: SessionUser | null = null;
  publishedProjects: Project[] = [];
  myTeams: StudentTeam[] = [];
  universityTeams: StudentTeam[] = [];
  myApplications: ProjectApplication[] = [];

  activeTab = 'projects';

  readonly navItems: DashboardNavItem[] = [
    { id: 'projects',     label: 'Proyectos',              accent: 'accent-1' },
    { id: 'applications', label: 'Mis postulaciones',      accent: 'accent-2' },
    { id: 'my-teams',     label: 'Mis equipos',            accent: 'accent-3' },
    { id: 'all-teams',    label: 'Equipos universidad',    accent: 'accent-4' },
    { id: 'profile',      label: 'Mi perfil',              accent: 'accent-2' },
  ];

  isLoadingProjects = false;
  isLoadingTeams = false;
  isLoadingApplications = false;

  // Apply modal
  applyingToProject: Project | null = null;
  applyMessage = '';
  applyTeamId: number | null = null;
  isSubmittingApply = false;
  appliedProjectIds = new Set<number>();

  // Team management
  showCreateTeamForm = false;
  isCreatingTeam = false;
  newTeamName = '';
  newTeamDescription = '';
  showAddMemberForm: number | null = null;
  isAddingMember = false;
  newMemberEmail = '';

  // Profile edit
  isEditingProfile = false;
  isSavingProfile = false;
  profileCareer = '';
  profileSemester: number | null = null;
  profileBio = '';

  get avatarLabel(): string {
    return this.currentUser?.displayName?.charAt(0)?.toUpperCase() ?? 'E';
  }

  get dashboardTitle(): string {
    return this.currentUser?.displayName ?? 'Estudiante';
  }

  ngOnInit(): void {
    this.userSessionService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileCareer = user.career ?? '';
        this.profileSemester = user.semester ?? null;
        this.profileBio = user.bio ?? '';
      }
    });
    this.loadProjects();
    this.loadMyTeams();
    this.loadMyApplications();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'all-teams' && this.universityTeams.length === 0) {
      this.loadUniversityTeams();
    }
  }

  loadProjects(): void {
    this.isLoadingProjects = true;
    this.studentService.listPublishedProjects().subscribe({
      next: projects => {
        this.publishedProjects = projects;
        this.isLoadingProjects = false;
      },
      error: () => {
        this.isLoadingProjects = false;
        this.toast.error('No pudimos cargar los proyectos.');
      }
    });
  }

  loadMyApplications(): void {
    this.isLoadingApplications = true;
    this.studentService.listMyApplications().subscribe({
      next: apps => {
        this.myApplications = apps;
        this.appliedProjectIds = new Set(apps.map(a => a.projectId));
        this.isLoadingApplications = false;
      },
      error: () => { this.isLoadingApplications = false; }
    });
  }

  loadMyTeams(): void {
    this.isLoadingTeams = true;
    this.studentService.listMyTeams().subscribe({
      next: teams => {
        this.myTeams = teams;
        this.isLoadingTeams = false;
      },
      error: () => { this.isLoadingTeams = false; }
    });
  }

  loadUniversityTeams(): void {
    this.studentService.listUniversityTeams().subscribe({
      next: teams => { this.universityTeams = teams; },
      error: () => { this.toast.error('No pudimos cargar los equipos.'); }
    });
  }

  // ── Apply ─────────────────────────────────────────
  openApply(project: Project): void {
    this.applyingToProject = project;
    this.applyMessage = '';
    this.applyTeamId = null;
  }

  closeApply(): void { this.applyingToProject = null; }

  submitApply(): void {
    if (!this.applyingToProject) return;
    this.isSubmittingApply = true;
    this.studentService.applyToProject(this.applyingToProject.id, {
      message: this.applyMessage.trim() || null,
      teamId: this.applyTeamId
    }).subscribe({
      next: app => {
        this.myApplications = [app, ...this.myApplications];
        this.appliedProjectIds.add(app.projectId);
        this.applyingToProject = null;
        this.isSubmittingApply = false;
        this.toast.success('¡Postulación enviada correctamente!');
      },
      error: err => {
        this.isSubmittingApply = false;
        this.toast.error(err?.error?.message || 'No pudimos enviar tu postulación.');
      }
    });
  }

  hasApplied(projectId: number): boolean { return this.appliedProjectIds.has(projectId); }

  applicationStatusLabel(status: string): string {
    return status === 'PENDING' ? 'Pendiente' : status === 'ACCEPTED' ? 'Aceptada' : 'Rechazada';
  }

  applicationStatusClass(status: string): string {
    if (status === 'ACCEPTED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  }

  // ── Teams ─────────────────────────────────────────
  createTeam(): void {
    if (!this.newTeamName.trim()) return;
    this.isCreatingTeam = true;
    this.studentService.createTeam({ name: this.newTeamName.trim(), description: this.newTeamDescription.trim() || null }).subscribe({
      next: team => {
        this.myTeams = [team, ...this.myTeams];
        this.showCreateTeamForm = false;
        this.newTeamName = '';
        this.newTeamDescription = '';
        this.isCreatingTeam = false;
        this.toast.success('Equipo creado correctamente.');
      },
      error: err => {
        this.isCreatingTeam = false;
        this.toast.error(err?.error?.message || 'No pudimos crear el equipo.');
      }
    });
  }

  openAddMember(teamId: number): void { this.showAddMemberForm = teamId; this.newMemberEmail = ''; }

  addMember(teamId: number): void {
    if (!this.newMemberEmail.trim()) return;
    this.isAddingMember = true;
    this.studentService.addMember(teamId, { email: this.newMemberEmail.trim() }).subscribe({
      next: updatedTeam => {
        this.myTeams = this.myTeams.map(t => t.id === teamId ? updatedTeam : t);
        this.showAddMemberForm = null;
        this.newMemberEmail = '';
        this.isAddingMember = false;
        this.toast.success('Miembro agregado correctamente.');
      },
      error: err => {
        this.isAddingMember = false;
        this.toast.error(err?.error?.message || 'No pudimos agregar al miembro.');
      }
    });
  }

  removeMember(teamId: number, memberId: number): void {
    this.studentService.removeMember(teamId, memberId).subscribe({
      next: () => {
        this.myTeams = this.myTeams.map(t =>
          t.id === teamId ? { ...t, members: t.members.filter(m => m.userId !== memberId) } : t
        );
        this.toast.success('Miembro removido.');
      },
      error: err => { this.toast.error(err?.error?.message || 'No pudimos remover al miembro.'); }
    });
  }

  isLeader(team: StudentTeam): boolean {
    return this.currentUser !== null && team.leaderId === this.currentUser.id;
  }

  // ── Profile ───────────────────────────────────────
  openProfileEdit(): void {
    this.profileCareer = this.currentUser?.career ?? '';
    this.profileSemester = this.currentUser?.semester ?? null;
    this.profileBio = this.currentUser?.bio ?? '';
    this.isEditingProfile = true;
  }

  saveProfile(): void {
    this.isSavingProfile = true;
    this.studentService.updateProfile({
      career: this.profileCareer.trim() || null,
      semester: this.profileSemester,
      bio: this.profileBio.trim() || null
    }).subscribe({
      next: updatedUser => {
        this.userSessionService.setCurrentUser(updatedUser);
        this.currentUser = updatedUser;
        this.isEditingProfile = false;
        this.isSavingProfile = false;
        this.toast.success('Perfil actualizado correctamente.');
      },
      error: err => {
        this.isSavingProfile = false;
        this.toast.error(err?.error?.message || 'No pudimos actualizar tu perfil.');
      }
    });
  }
}

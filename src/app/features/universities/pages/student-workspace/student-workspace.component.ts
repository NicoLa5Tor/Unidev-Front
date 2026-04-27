import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { DashboardShellComponent, DashboardNavItem } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { StudentTeam, ProjectApplication, TeamInvitation } from '../../../../shared/models/student.model';
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
  invitations: TeamInvitation[] = [];
  pendingCount = 0;

  activeTab = 'projects';

  navItems: DashboardNavItem[] = [
    { id: 'projects',     label: 'Proyectos',       accent: 'accent-1' },
    { id: 'applications', label: 'Postulaciones',   accent: 'accent-2' },
    { id: 'my-teams',     label: 'Mis equipos',     accent: 'accent-3' },
    { id: 'all-teams',    label: 'Universidad',     accent: 'accent-4' },
    { id: 'invitations',  label: 'Notificaciones',  accent: 'accent-2' },
    { id: 'profile',      label: 'Mi perfil',       accent: 'accent-3' },
  ];

  isLoadingProjects = false;
  isLoadingTeams = false;
  isLoadingApplications = false;
  isLoadingInvitations = false;

  // Apply modal
  applyingToProject: Project | null = null;
  applyMessage = '';
  applyTeamId: number | null = null;
  isSubmittingApply = false;
  appliedProjectIds = new Set<number>();

  // Invite modal (leader invites)
  invitingTeamId: number | null = null;
  inviteEmail = '';
  inviteMessage = '';
  isSubmittingInvite = false;

  // Join request modal (student requests to join)
  joiningTeam: StudentTeam | null = null;
  joinMessage = '';
  isSubmittingJoin = false;
  pendingJoinTeamIds = new Set<number>();

  // Team management
  showCreateTeamForm = false;
  isCreatingTeam = false;
  newTeamName = '';
  newTeamDescription = '';

  // Profile edit
  isEditingProfile = false;
  isSavingProfile = false;
  isUploadingPhoto = false;
  profileCareer = '';
  profileSemester: number | null = null;
  profileBio = '';
  profileLinkedinUrl = '';
  profileGithubUrl = '';
  profilePortfolioUrl = '';
  profileSkills = '';
  profileCity = '';
  profileAvailableForProjects = false;
  profileSkillInput = '';
  profileSkillsList: string[] = [];

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
    this.loadInvitations();
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
      next: p => { this.publishedProjects = p; this.isLoadingProjects = false; },
      error: () => { this.isLoadingProjects = false; this.toast.error('No pudimos cargar los proyectos.'); }
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
      next: teams => { this.myTeams = teams; this.isLoadingTeams = false; },
      error: () => { this.isLoadingTeams = false; }
    });
  }

  loadUniversityTeams(): void {
    this.studentService.listUniversityTeams().subscribe({
      next: teams => {
        this.universityTeams = teams;
        this.pendingJoinTeamIds = new Set(
          this.invitations
            .filter(i => i.type === 'JOIN_REQUEST' && i.fromUserId === this.currentUser?.id && i.status === 'PENDING')
            .map(i => i.teamId)
        );
      },
      error: () => { this.toast.error('No pudimos cargar los equipos.'); }
    });
  }

  loadInvitations(): void {
    this.isLoadingInvitations = true;
    this.studentService.listInvitations().subscribe({
      next: invs => {
        this.invitations = invs;
        this.pendingJoinTeamIds = new Set(
          invs.filter(i => i.type === 'JOIN_REQUEST' && i.fromUserId === this.currentUser?.id && i.status === 'PENDING')
              .map(i => i.teamId)
        );
        this.updatePendingCount();
        this.isLoadingInvitations = false;
      },
      error: () => { this.isLoadingInvitations = false; }
    });
  }

  private updatePendingCount(): void {
    const uid = this.currentUser?.id;
    if (!uid) return;
    this.pendingCount = this.invitations.filter(i =>
      i.status === 'PENDING' && (
        (i.type === 'LEADER_INVITE' && i.toUserId === uid) ||
        (i.type === 'JOIN_REQUEST' && i.toUserId === uid)
      )
    ).length;
    // Update label on the existing array item (no new array reference)
    const notifItem = this.navItems.find(n => n.id === 'invitations');
    if (notifItem) {
      notifItem.label = this.pendingCount > 0 ? `Notificaciones (${this.pendingCount})` : 'Notificaciones';
    }
  }

  // ── Apply ─────────────────────────────────────────────
  openApply(project: Project): void { this.applyingToProject = project; this.applyMessage = ''; this.applyTeamId = null; }
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
      error: err => { this.isSubmittingApply = false; this.toast.error(err?.error?.message || 'No pudimos enviar tu postulación.'); }
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

  // ── Invite (leader → student) ─────────────────────────
  openInvite(teamId: number): void {
    this.invitingTeamId = teamId;
    this.inviteEmail = '';
    this.inviteMessage = '';
  }

  closeInvite(): void { this.invitingTeamId = null; }

  submitInvite(): void {
    if (!this.invitingTeamId || !this.inviteEmail.trim()) return;
    this.isSubmittingInvite = true;
    this.studentService.inviteMember(this.invitingTeamId, {
      email: this.inviteEmail.trim(),
      message: this.inviteMessage.trim() || null
    }).subscribe({
      next: () => {
        this.invitingTeamId = null;
        this.isSubmittingInvite = false;
        this.toast.success('Invitación enviada. El estudiante debe aceptarla para unirse al equipo.');
      },
      error: err => { this.isSubmittingInvite = false; this.toast.error(err?.error?.message || 'No pudimos enviar la invitación.'); }
    });
  }

  // ── Join request (student → team) ─────────────────────
  openJoinRequest(team: StudentTeam): void {
    this.joiningTeam = team;
    this.joinMessage = '';
  }

  closeJoinRequest(): void { this.joiningTeam = null; }

  submitJoinRequest(): void {
    if (!this.joiningTeam) return;
    this.isSubmittingJoin = true;
    this.studentService.requestJoin(this.joiningTeam.id, {
      message: this.joinMessage.trim() || null
    }).subscribe({
      next: inv => {
        this.invitations = [inv, ...this.invitations];
        this.pendingJoinTeamIds.add(inv.teamId);
        this.joiningTeam = null;
        this.isSubmittingJoin = false;
        this.toast.success('Solicitud enviada. El líder del equipo debe aceptarla.');
      },
      error: err => { this.isSubmittingJoin = false; this.toast.error(err?.error?.message || 'No pudimos enviar la solicitud.'); }
    });
  }

  hasPendingJoinRequest(teamId: number): boolean { return this.pendingJoinTeamIds.has(teamId); }

  isAlreadyMember(teamId: number): boolean {
    return this.myTeams.some(t => t.id === teamId);
  }

  // ── Respond to invitations ────────────────────────────
  acceptInvitation(inv: TeamInvitation): void {
    this.studentService.acceptInvitation(inv.id).subscribe({
      next: updated => {
        this.invitations = this.invitations.map(i => i.id === updated.id ? updated : i);
        this.updatePendingCount();
        // Refresh teams if we just joined one
        if (inv.type === 'LEADER_INVITE') {
          this.loadMyTeams();
          this.toast.success(`¡Te uniste al equipo "${inv.teamName}"!`);
        } else {
          this.toast.success('Solicitud aceptada. El estudiante ya es miembro del equipo.');
          this.loadMyTeams();
        }
      },
      error: err => { this.toast.error(err?.error?.message || 'No pudimos procesar la respuesta.'); }
    });
  }

  rejectInvitation(inv: TeamInvitation): void {
    this.studentService.rejectInvitation(inv.id).subscribe({
      next: updated => {
        this.invitations = this.invitations.map(i => i.id === updated.id ? updated : i);
        this.updatePendingCount();
        if (inv.type === 'JOIN_REQUEST') {
          this.pendingJoinTeamIds.delete(inv.teamId);
        }
        this.toast.success('Rechazado correctamente.');
      },
      error: err => { this.toast.error(err?.error?.message || 'No pudimos procesar la respuesta.'); }
    });
  }

  invitationLabel(inv: TeamInvitation): string {
    const uid = this.currentUser?.id;
    if (inv.type === 'LEADER_INVITE' && inv.toUserId === uid) return 'Invitación recibida';
    if (inv.type === 'JOIN_REQUEST' && inv.toUserId === uid) return 'Solicitud de ingreso';
    if (inv.type === 'JOIN_REQUEST' && inv.fromUserId === uid) return 'Solicitud enviada';
    return inv.type;
  }

  canRespond(inv: TeamInvitation): boolean {
    return inv.status === 'PENDING' && inv.toUserId === this.currentUser?.id;
  }

  // ── Team management ───────────────────────────────────
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
      error: err => { this.isCreatingTeam = false; this.toast.error(err?.error?.message || 'No pudimos crear el equipo.'); }
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

  // ── Profile ───────────────────────────────────────────
  openProfileEdit(): void {
    this.profileCareer = this.currentUser?.career ?? '';
    this.profileSemester = this.currentUser?.semester ?? null;
    this.profileBio = this.currentUser?.bio ?? '';
    this.profileLinkedinUrl = this.currentUser?.linkedinUrl ?? '';
    this.profileGithubUrl = this.currentUser?.githubUrl ?? '';
    this.profilePortfolioUrl = this.currentUser?.portfolioUrl ?? '';
    this.profileCity = this.currentUser?.city ?? '';
    this.profileAvailableForProjects = this.currentUser?.availableForProjects ?? false;
    const raw = this.currentUser?.skills ?? '';
    this.profileSkillsList = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
    this.profileSkillInput = '';
    this.isEditingProfile = true;
  }

  addSkill(): void {
    const s = this.profileSkillInput.trim();
    if (s && !this.profileSkillsList.includes(s)) {
      this.profileSkillsList = [...this.profileSkillsList, s];
    }
    this.profileSkillInput = '';
  }

  removeSkill(skill: string): void {
    this.profileSkillsList = this.profileSkillsList.filter(s => s !== skill);
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  saveProfile(): void {
    this.isSavingProfile = true;
    this.studentService.updateProfile({
      career: this.profileCareer.trim() || null,
      semester: this.profileSemester,
      bio: this.profileBio.trim() || null,
      linkedinUrl: this.profileLinkedinUrl.trim() || null,
      githubUrl: this.profileGithubUrl.trim() || null,
      portfolioUrl: this.profilePortfolioUrl.trim() || null,
      skills: this.profileSkillsList.join(',') || null,
      city: this.profileCity.trim() || null,
      availableForProjects: this.profileAvailableForProjects
    }).subscribe({
      next: updatedUser => {
        this.userSessionService.setCurrentUser(updatedUser);
        this.currentUser = updatedUser;
        this.isEditingProfile = false;
        this.isSavingProfile = false;
        this.toast.success('Perfil actualizado correctamente.');
      },
      error: err => { this.isSavingProfile = false; this.toast.error(err?.error?.message || 'No pudimos actualizar tu perfil.'); }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploadingPhoto = true;
    this.studentService.uploadPhoto(file).subscribe({
      next: updatedUser => {
        this.userSessionService.setCurrentUser(updatedUser);
        this.currentUser = updatedUser;
        this.isUploadingPhoto = false;
        this.toast.success('Foto actualizada.');
      },
      error: err => { this.isUploadingPhoto = false; this.toast.error(err?.error?.message || 'No pudimos subir la foto.'); }
    });
  }

  invitationStatusClass(status: string): string {
    if (status === 'ACCEPTED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (status === 'REJECTED') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  }

  invitationStatusLabel(status: string): string {
    return status === 'PENDING' ? 'Pendiente' : status === 'ACCEPTED' ? 'Aceptada' : 'Rechazada';
  }
}

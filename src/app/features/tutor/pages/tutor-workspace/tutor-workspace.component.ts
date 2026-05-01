import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { DashboardShellComponent, DashboardNavItem } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { StudentService } from '../../../universities/services/student.service';
import { StudentTeam, TeamInvitation } from '../../../../shared/models/student.model';
import { Project } from '../../../../shared/models/project.model';
import { SessionUser } from '../../../../shared/models/session-user.model';
import { TeamChatDialogComponent } from '../../../../shared/components/team-chat-dialog/team-chat-dialog.component';

@Component({
  selector: 'app-tutor-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './tutor-workspace.component.html'
})
export class TutorWorkspaceComponent implements OnInit, OnDestroy {
  private readonly userSessionService = inject(UserSessionService);
  private readonly studentService = inject(StudentService);
  private readonly toast = inject(UiToastService);
  private readonly dialog = inject(MatDialog);

  currentUser: SessionUser | null = null;
  campusTeams: StudentTeam[] = [];
  publishedProjects: Project[] = [];
  invitations: TeamInvitation[] = [];

  activeTab = 'teams';

  navItems: DashboardNavItem[] = [
    { id: 'my-teams', label: 'Mis equipos',   accent: 'accent-1' },
    { id: 'teams',    label: 'Sede',          accent: 'accent-2' },
    { id: 'projects', label: 'Proyectos',     accent: 'accent-3' },
    { id: 'notifications', label: 'Notificaciones', accent: 'accent-4' },
    { id: 'profile',  label: 'Mi perfil',     accent: 'accent-1' },
  ];

  isLoadingTeams = false;
  isLoadingMyTutoredTeams = false;
  isLoadingProjects = false;
  isLoadingInvitations = false;

  private notifPollHandle: ReturnType<typeof setInterval> | null = null;
  private lastKnownPendingCount = -1;

  myTutoredTeams: StudentTeam[] = [];

  // Tutor request modal
  requestingTeam: StudentTeam | null = null;
  tutorRequestMessage = '';
  isSubmittingTutorRequest = false;

  // Profile edit
  isEditingProfile = false;
  isSavingProfile = false;
  profileBio = '';
  profileLinkedinUrl = '';
  profileGithubUrl = '';
  profilePortfolioUrl = '';
  profileSkills = '';
  profileCity = '';

  ngOnInit(): void {
    this.userSessionService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileBio = user.bio ?? '';
        this.profileLinkedinUrl = user.linkedinUrl ?? '';
        this.profileGithubUrl = user.githubUrl ?? '';
        this.profilePortfolioUrl = user.portfolioUrl ?? '';
        this.profileSkills = user.skills ?? '';
        this.profileCity = user.city ?? '';
      }
    });
    this.loadMyTutoredTeams();
    this.startNotifPolling();
  }

  ngOnDestroy(): void {
    this.stopNotifPolling();
  }

  private startNotifPolling(): void {
    this.notifPollHandle = setInterval(() => {
      this.studentService.pendingCount().subscribe({
        next: ({ count }) => {
          if (this.lastKnownPendingCount >= 0 && count > this.lastKnownPendingCount) {
            const diff = count - this.lastKnownPendingCount;
            this.toast.notify(
              `${diff === 1 ? 'Nueva solicitud' : `${diff} nuevas solicitudes`} pendiente${diff === 1 ? '' : 's'}`,
              () => {
                this.activeTab = 'notifications';
                this.loadInvitations();
              },
              'Ver'
            );
          }
          this.lastKnownPendingCount = count;
        }
      });
    }, 15000);
  }

  private stopNotifPolling(): void {
    if (this.notifPollHandle != null) {
      clearInterval(this.notifPollHandle);
      this.notifPollHandle = null;
    }
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    if (tab === 'my-teams') this.loadMyTutoredTeams();
    if (tab === 'teams') this.loadTeams();
    if (tab === 'projects') this.loadProjects();
    if (tab === 'notifications') this.loadInvitations();
  }

  loadMyTutoredTeams(): void {
    this.isLoadingMyTutoredTeams = true;
    this.studentService.listMyTutoredTeams().subscribe({
      next: teams => { this.myTutoredTeams = teams; this.isLoadingMyTutoredTeams = false; },
      error: () => { this.isLoadingMyTutoredTeams = false; }
    });
  }

  loadTeams(): void {
    this.isLoadingTeams = true;
    this.studentService.listCampusTeams().subscribe({
      next: teams => {
        this.campusTeams = teams;
        this.isLoadingTeams = false;
      },
      error: () => {
        this.isLoadingTeams = false;
      }
    });
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
      }
    });
  }

  loadInvitations(): void {
    this.isLoadingInvitations = true;
    this.studentService.listInvitations().subscribe({
      next: invitations => {
        this.invitations = invitations;
        this.isLoadingInvitations = false;
      },
      error: () => {
        this.isLoadingInvitations = false;
      }
    });
  }

  startEditProfile(): void {
    if (!this.currentUser) return;
    this.profileBio = this.currentUser.bio ?? '';
    this.profileLinkedinUrl = this.currentUser.linkedinUrl ?? '';
    this.profileGithubUrl = this.currentUser.githubUrl ?? '';
    this.profilePortfolioUrl = this.currentUser.portfolioUrl ?? '';
    this.profileSkills = this.currentUser.skills ?? '';
    this.profileCity = this.currentUser.city ?? '';
    this.isEditingProfile = true;
  }

  saveProfile(): void {
    this.isSavingProfile = true;
    this.studentService.updateProfile({
      bio: this.profileBio || null,
      linkedinUrl: this.profileLinkedinUrl || null,
      githubUrl: this.profileGithubUrl || null,
      portfolioUrl: this.profilePortfolioUrl || null,
      skills: this.profileSkills || null,
      city: this.profileCity || null,
    }).subscribe({
      next: updated => {
        this.userSessionService.loadCurrentUser(true).subscribe(u => this.currentUser = u);
        this.isSavingProfile = false;
        this.isEditingProfile = false;
        this.toast.success('Perfil actualizado');
      },
      error: () => {
        this.isSavingProfile = false;
        this.toast.error('No se pudo guardar el perfil');
      }
    });
  }

  openTutorRequest(team: StudentTeam): void {
    this.requestingTeam = team;
    this.tutorRequestMessage = '';
  }

  submitTutorRequest(): void {
    if (!this.requestingTeam) return;
    this.isSubmittingTutorRequest = true;
    this.studentService.requestTutoring(this.requestingTeam.id, { message: this.tutorRequestMessage || null }).subscribe({
      next: () => {
        this.requestingTeam = null;
        this.isSubmittingTutorRequest = false;
        this.toast.success('Solicitud de tutoría enviada al líder del equipo');
      },
      error: (err) => {
        this.isSubmittingTutorRequest = false;
        this.toast.error(err?.error?.message || 'No se pudo enviar la solicitud');
      }
    });
  }

  acceptInvitation(id: number): void {
    this.studentService.acceptInvitation(id).subscribe({
      next: () => {
        this.invitations = this.invitations.map(i => i.id === id ? { ...i, status: 'ACCEPTED' } : i);
        this.toast.success('Solicitud aceptada');
      },
      error: () => this.toast.error('No se pudo aceptar la solicitud')
    });
  }

  openTeamChat(team: StudentTeam): void {
    if (!this.currentUser) return;
    this.dialog.open(TeamChatDialogComponent, {
      width: '680px',
      maxWidth: '96vw',
      maxHeight: '88vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: {
        teamId: team.id,
        teamName: team.name,
        currentUserId: this.currentUser.id
      }
    });
  }

  rejectInvitation(id: number): void {
    this.studentService.rejectInvitation(id).subscribe({
      next: () => {
        this.invitations = this.invitations.map(i => i.id === id ? { ...i, status: 'REJECTED' } : i);
        this.toast.success('Solicitud rechazada');
      },
      error: () => this.toast.error('No se pudo rechazar la solicitud')
    });
  }
}

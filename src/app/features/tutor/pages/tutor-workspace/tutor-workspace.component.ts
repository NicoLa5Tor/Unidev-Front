import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { DashboardShellComponent, DashboardNavItem } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { StudentService } from '../../../universities/services/student.service';
import { PaymentService } from '../../../companies/services/payment.service';
import { StudentTeam, TeamInvitation, ProjectApplication } from '../../../../shared/models/student.model';
import { Project } from '../../../../shared/models/project.model';
import { ProjectPaymentResponse } from '../../../../shared/models/payment.model';
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
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(UiToastService);
  private readonly dialog = inject(MatDialog);

  currentUser: SessionUser | null = null;
  campusTeams: StudentTeam[] = [];
  publishedProjects: Project[] = [];
  invitations: TeamInvitation[] = [];

  mpStatus: 'NOT_CONNECTED' | 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | null = null;
  mpConnecting = false;
  mpDisconnecting = false;

  activeTab = 'teams';

  navItems: DashboardNavItem[] = [
    { id: 'my-teams',      label: 'Mis equipos',      accent: 'accent-1' },
    { id: 'teams',         label: 'Sede',             accent: 'accent-2' },
    { id: 'projects',      label: 'Proyectos',        accent: 'accent-3' },
    { id: 'my-projects',   label: 'Mis proyectos',    accent: 'accent-4' },
    { id: 'notifications', label: 'Notificaciones',   accent: 'accent-4' },
    { id: 'profile',       label: 'Mi perfil',        accent: 'accent-1' },
  ];

  isLoadingTeams = false;
  isLoadingMyTutoredTeams = false;
  isLoadingProjects = false;
  isLoadingInvitations = false;

  private notifPollHandle: ReturnType<typeof setInterval> | null = null;
  private lastKnownPendingCount = -1;

  myTutoredTeams: StudentTeam[] = [];
  myApplications: ProjectApplication[] = [];
  isLoadingApplications = false;
  projectPayments = new Map<number, ProjectPaymentResponse>();

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
    this.loadMpStatus();
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
    if (tab === 'my-projects') this.loadMyApplications();
    if (tab === 'notifications') this.loadInvitations();
  }

  loadMyApplications(): void {
    this.isLoadingApplications = true;
    this.studentService.listMyApplications().subscribe({
      next: apps => {
        this.myApplications = apps;
        this.isLoadingApplications = false;
        apps.filter(a => a.status === 'ACCEPTED').forEach(a => this.loadProjectPayment(a.projectId));
      },
      error: () => { this.isLoadingApplications = false; }
    });
  }

  loadProjectPayment(projectId: number): void {
    this.paymentService.getSellerPaymentStatus(projectId).subscribe({
      next: payment => { if (payment) this.projectPayments.set(projectId, payment); },
      error: () => {}
    });
  }

  getProjectPayment(projectId: number): ProjectPaymentResponse | null {
    return this.projectPayments.get(projectId) ?? null;
  }

  paymentStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'PENDING_PAYMENT': return 'Pago pendiente';
      case 'PAID_HELD':       return 'Pago recibido — en custodia';
      case 'RELEASED':        return 'Pago desembolsado';
      case 'REFUNDED':        return 'Pago reembolsado';
      case 'FAILED':          return 'Pago fallido';
      default:                return 'Sin pago registrado';
    }
  }

  paymentStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PAID_HELD':  return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'RELEASED':   return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
      case 'REFUNDED':   return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      case 'FAILED':     return 'border-red-500/30 bg-red-500/10 text-red-400';
      default:           return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    }
  }

  formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    if (amount == null || !Number.isFinite(amount)) return 'Pendiente';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  loadMpStatus(): void {
    this.paymentService.getUserConnectStatus().subscribe({
      next: res => { this.mpStatus = res.status as any; },
      error: () => { this.mpStatus = 'NOT_CONNECTED'; }
    });
  }

  connectMp(): void {
    if (this.mpConnecting) return;
    this.mpConnecting = true;
    this.paymentService.initUserConnect().subscribe({
      next: res => {
        this.mpConnecting = false;
        if (res.status === 'CONNECTED') {
          this.mpStatus = 'CONNECTED';
          this.toast.success('Tu cuenta de Mercado Pago ya está conectada.');
          return;
        }
        if (res.authUrl) {
          this.mpStatus = 'PENDING';
          const popup = window.open(res.authUrl, 'mp_oauth', 'width=700,height=600');
          const onMessage = (event: MessageEvent) => {
            if (event.data?.type === 'MP_OAUTH_SUCCESS') {
              window.removeEventListener('message', onMessage);
              this.loadMpStatus();
              this.toast.success('¡Cuenta de Mercado Pago conectada correctamente!');
            } else if (event.data?.type === 'MP_OAUTH_ERROR') {
              window.removeEventListener('message', onMessage);
              this.mpStatus = 'NOT_CONNECTED';
              this.toast.error('No pudimos conectar tu cuenta de Mercado Pago.');
            }
          };
          window.addEventListener('message', onMessage);
          const pollClose = setInterval(() => {
            if (popup?.closed) {
              clearInterval(pollClose);
              window.removeEventListener('message', onMessage);
              this.loadMpStatus();
            }
          }, 1000);
        }
      },
      error: err => {
        this.mpConnecting = false;
        this.toast.error(err?.error?.message ?? 'No pudimos iniciar la conexión con Mercado Pago.');
      }
    });
  }

  disconnectMp(): void {
    if (this.mpDisconnecting) return;
    this.mpDisconnecting = true;
    this.paymentService.disconnectUser().subscribe({
      next: () => {
        this.mpStatus = 'DISCONNECTED';
        this.mpDisconnecting = false;
        this.toast.success('Cuenta de Mercado Pago desvinculada.');
      },
      error: () => {
        this.mpDisconnecting = false;
        this.toast.error('No pudimos desvincular la cuenta.');
      }
    });
  }

  openTutorRequest(team: StudentTeam): void {
    if (this.mpStatus !== 'CONNECTED') {
      this.toast.error('Debes vincular tu cuenta de Mercado Pago antes de solicitar tutoría. Ve a "Mi perfil".');
      return;
    }
    this.requestingTeam = team;
    this.tutorRequestMessage = '';
  }

  submitTutorRequest(): void {
    if (!this.requestingTeam) return;
    if (this.mpStatus !== 'CONNECTED') {
      this.toast.error('Debes vincular tu cuenta de Mercado Pago antes de solicitar tutoría.');
      return;
    }
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

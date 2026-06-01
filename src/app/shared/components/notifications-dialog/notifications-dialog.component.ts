import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { AnnouncementService } from '../../../features/admin/services/announcement.service';
import { PqrsService } from '../../services/pqrs.service';
import { DeploymentService } from '../../services/deployment.service';
import { UiToastService } from '../../services/ui-toast.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { StudentService } from '../../../features/universities/services/student.service';
import { Announcement } from '../../models/announcement.model';
import { Pqrs, PqrsStatus, PqrsType } from '../../models/pqrs.model';
import { TeamInvitation } from '../../models/student.model';
import { Deployment } from '../../models/deployment.model';
import { DeliveryChatDialogComponent } from '../delivery-chat-dialog/delivery-chat-dialog.component';

export interface PendingReviewProject {
  projectId: number;
  projectName: string;
  applicationId: number | null;
  deploymentCount: number;
  latestPublishedAt: string | null;
}

type MainTab = 'invitations' | 'announcements' | 'pqrs' | 'deployments';
type PqrsSubTab = 'list' | 'new';

@Component({
  selector: 'app-notifications-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './notifications-dialog.component.html'
})
export class NotificationsDialogComponent implements OnInit {
  mainTab: MainTab = 'announcements';

  // ── Invitations ────────────────────────────────────────
  invitations: TeamInvitation[] = [];
  loadingInvitations = false;

  // ── Announcements ──────────────────────────────────────
  announcements: Announcement[] = [];
  loadingAnnouncements = false;
  expandedAnnouncementId: number | null = null;
  lastSeenAnnouncementId = 0;

  // ── Deployments (company) ─────────────────────────────
  pendingDeployments: Deployment[] = [];
  pendingReviewProjects: PendingReviewProject[] = [];
  loadingDeployments = false;

  // ── PQRS ──────────────────────────────────────────────
  pqrsSubTab: PqrsSubTab = 'list';
  tickets: Pqrs[] = [];
  loadingTickets = false;
  selectedTicket: Pqrs | null = null;

  pqrsType: PqrsType = 'PETICION';
  pqrsSubject = '';
  pqrsMessage = '';
  sending = false;
  sent: Pqrs | null = null;

  readonly types: Array<{ value: PqrsType; label: string; description: string }> = [
    { value: 'PETICION',   label: 'Petición',   description: 'Solicitud de un servicio o información' },
    { value: 'QUEJA',      label: 'Queja',      description: 'Inconformidad con el servicio recibido' },
    { value: 'RECLAMO',    label: 'Reclamo',    description: 'Exigencia de un derecho o corrección' },
    { value: 'SUGERENCIA', label: 'Sugerencia', description: 'Propuesta para mejorar la plataforma' }
  ];

  readonly typeLabels: Record<PqrsType, string> = {
    PETICION: 'Petición', QUEJA: 'Queja', RECLAMO: 'Reclamo', SUGERENCIA: 'Sugerencia'
  };

  readonly statusLabels: Record<PqrsStatus, string> = {
    OPEN: 'Abierto', IN_PROGRESS: 'En progreso', CLOSED: 'Cerrado'
  };

  constructor(
    private readonly dialogRef: MatDialogRef<NotificationsDialogComponent>,
    private readonly announcementService: AnnouncementService,
    private readonly pqrsService: PqrsService,
    private readonly studentService: StudentService,
    private readonly deploymentService: DeploymentService,
    private readonly toast: UiToastService,
    private readonly userSessionService: UserSessionService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userId = this.userSessionService.snapshot?.id ?? 'anon';
    this.lastSeenAnnouncementId = Number(localStorage.getItem(`lastSeenAnnouncement_${userId}`) ?? 0);

    if (this.showInvitationsTab) {
      this.mainTab = 'invitations';
      this.loadInvitations();
    }
    if (this.showDeploymentsTab) {
      this.mainTab = 'deployments';
      this.loadPendingDeployments();
    }
    this.loadAnnouncements();
    this.loadTickets();
  }

  get showInvitationsTab(): boolean {
    const role = this.userSessionService.snapshot?.roleName;
    return role === 'USUARIOS_UNIVERSIDAD' || role === 'TUTOR_SEDE';
  }

  get showDeploymentsTab(): boolean {
    const role = this.userSessionService.snapshot?.roleName;
    return role === 'EMPRESAS' || role === 'USUARIOS_EMPRESA';
  }

  get currentUserId(): number {
    return this.userSessionService.snapshot?.id ?? -1;
  }

  get pendingInvitationCount(): number {
    return this.invitations.filter(i => i.status === 'PENDING' && i.toUserId === this.currentUserId).length;
  }

  // ── Invitations ────────────────────────────────────────

  loadInvitations(): void {
    this.loadingInvitations = true;
    this.studentService.listInvitations().subscribe({
      next: invs => { this.invitations = invs; this.loadingInvitations = false; },
      error: () => { this.loadingInvitations = false; }
    });
  }

  canRespond(inv: TeamInvitation): boolean {
    return inv.status === 'PENDING' && inv.toUserId === (this.userSessionService.snapshot?.id ?? -1);
  }

  acceptInvitation(inv: TeamInvitation): void {
    this.studentService.acceptInvitation(inv.id).subscribe({
      next: updated => {
        this.invitations = this.invitations.map(i => i.id === updated.id ? updated : i);
        const label = inv.type === 'LEADER_INVITE'
          ? `¡Te uniste al equipo "${inv.teamName}"!`
          : 'Solicitud aceptada.';
        this.toast.success(label);
      },
      error: err => { this.toast.error(err?.error?.message || 'No pudimos procesar la respuesta.'); }
    });
  }

  rejectInvitation(inv: TeamInvitation): void {
    this.studentService.rejectInvitation(inv.id).subscribe({
      next: updated => {
        this.invitations = this.invitations.map(i => i.id === updated.id ? updated : i);
        this.toast.success('Rechazado correctamente.');
      },
      error: err => { this.toast.error(err?.error?.message || 'No pudimos procesar la respuesta.'); }
    });
  }

  invitationLabel(inv: TeamInvitation): string {
    const uid = this.userSessionService.snapshot?.id;
    if (inv.type === 'LEADER_INVITE' && inv.toUserId === uid) return 'Invitación recibida';
    if (inv.type === 'JOIN_REQUEST' && inv.toUserId === uid) return 'Solicitud de ingreso';
    if (inv.type === 'JOIN_REQUEST' && inv.fromUserId === uid) return 'Solicitud enviada';
    return inv.type;
  }

  invitationStatusClass(status: string): string {
    if (status === 'ACCEPTED') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    if (status === 'REJECTED') return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
    return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  }

  invitationStatusLabel(status: string): string {
    return status === 'PENDING' ? 'Pendiente' : status === 'ACCEPTED' ? 'Aceptada' : 'Rechazada';
  }

  // ── Announcements ──────────────────────────────────────

  loadAnnouncements(): void {
    this.loadingAnnouncements = true;
    this.announcementService.inbox().subscribe({
      next: items => {
        this.announcements = items;
        this.loadingAnnouncements = false;
        this.markAnnouncementsRead(items);
      },
      error: () => { this.loadingAnnouncements = false; }
    });
  }

  toggleAnnouncement(id: number): void {
    this.expandedAnnouncementId = this.expandedAnnouncementId === id ? null : id;
  }

  isNewAnnouncement(a: Announcement): boolean {
    return a.id > this.lastSeenAnnouncementId;
  }

  private markAnnouncementsRead(items: Announcement[]): void {
    if (!items.length) return;
    const maxId = Math.max(...items.map(a => a.id));
    const userId = this.userSessionService.snapshot?.id ?? 'anon';
    localStorage.setItem(`lastSeenAnnouncement_${userId}`, String(maxId));
  }

  // ── PQRS ──────────────────────────────────────────────

  loadTickets(): void {
    this.loadingTickets = true;
    this.pqrsService.mine().subscribe({
      next: tickets => { this.tickets = tickets; this.loadingTickets = false; },
      error: () => { this.loadingTickets = false; }
    });
  }

  switchPqrsSubTab(t: PqrsSubTab): void {
    this.pqrsSubTab = t;
    this.selectedTicket = null;
    if (t === 'list') this.resetPqrsForm();
  }

  selectTicket(ticket: Pqrs): void {
    this.selectedTicket = this.selectedTicket?.id === ticket.id ? null : ticket;
  }

  get canSend(): boolean {
    return this.pqrsSubject.trim().length > 0 && this.pqrsMessage.trim().length > 0 && !this.sending;
  }

  send(): void {
    if (!this.canSend) return;
    this.sending = true;
    this.pqrsService.create({
      type: this.pqrsType,
      subject: this.pqrsSubject.trim(),
      message: this.pqrsMessage.trim()
    }).subscribe({
      next: pqrs => {
        this.sent = pqrs;
        this.sending = false;
        this.tickets = [pqrs, ...this.tickets];
      },
      error: error => {
        this.sending = false;
        this.toast.error(error?.error?.message || 'No pudimos enviar tu solicitud.');
      }
    });
  }

  backToList(): void {
    this.sent = null;
    this.resetPqrsForm();
    this.pqrsSubTab = 'list';
  }

  // ── Shared ─────────────────────────────────────────────

  statusDot(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN':        return 'bg-emerald-400';
      case 'IN_PROGRESS': return 'bg-[var(--accent-2)]';
      case 'CLOSED':      return 'bg-[var(--muted)]';
    }
  }

  statusText(status: PqrsStatus): string {
    switch (status) {
      case 'OPEN':        return 'text-emerald-400';
      case 'IN_PROGRESS': return 'text-[var(--accent-2)]';
      case 'CLOSED':      return 'text-[var(--muted)]';
    }
  }

  // ── Deployments (company) ─────────────────────────────

  loadPendingDeployments(): void {
    this.loadingDeployments = true;
    this.deploymentService.companyPendingReview().subscribe({
      next: deps => {
        this.pendingDeployments = deps;
        this.pendingReviewProjects = this.computePendingReviewProjects(deps);
        this.loadingDeployments = false;
      },
      error: () => { this.loadingDeployments = false; }
    });
  }

  private computePendingReviewProjects(deps: Deployment[]): PendingReviewProject[] {
    const map = new Map<number, PendingReviewProject>();
    for (const dep of deps) {
      if (!dep.projectId) continue;
      const existing = map.get(dep.projectId);
      if (existing) {
        existing.deploymentCount++;
        if (dep.publishedAt && (!existing.latestPublishedAt || dep.publishedAt > existing.latestPublishedAt)) {
          existing.latestPublishedAt = dep.publishedAt;
        }
      } else {
        map.set(dep.projectId, {
          projectId: dep.projectId,
          projectName: dep.projectName ?? `Proyecto #${dep.projectId}`,
          applicationId: dep.applicationId ?? null,
          deploymentCount: 1,
          latestPublishedAt: dep.publishedAt ?? null
        });
      }
    }
    return Array.from(map.values());
  }

  openProject(projectId: number): void {
    const item = this.pendingReviewProjects.find(p => p.projectId === projectId);
    if (!item?.applicationId) {
      this.toast.error('No se pudo abrir el chat de entrega.');
      return;
    }
    this.dialogRef.close();
    this.dialog.open(DeliveryChatDialogComponent, {
      width: '1100px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      panelClass: 'app-shell-dialog-panel',
      backdropClass: 'app-shell-dialog-backdrop',
      data: { viewerMode: 'company', applicationId: item.applicationId, projectId }
    });
  }

  // ── Shared ─────────────────────────────────────────────

  close(): void {
    this.dialogRef.close();
  }

  private resetPqrsForm(): void {
    this.pqrsType = 'PETICION';
    this.pqrsSubject = '';
    this.pqrsMessage = '';
    this.sending = false;
    this.sent = null;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  StudentTeam, CreateStudentTeamDto,
  ProjectApplication, ApplyToProjectDto, StudentProfileUpdateDto,
  TeamInvitation, TeamInviteDto, TeamJoinRequestDto
} from '../../../shared/models/student.model';
import { Project, ProjectDetail } from '../../../shared/models/project.model';
import { SessionUser } from '../../../shared/models/session-user.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // ── Projects ──────────────────────────────────────────
  listPublishedProjects() {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/published`);
  }

  getPublishedProjectDetail(projectId: number) {
    return this.http.get<ProjectDetail>(`${this.baseUrl}/student/projects/${projectId}`);
  }

  applyToProject(projectId: number, payload: ApplyToProjectDto) {
    return this.http.post<ProjectApplication>(`${this.baseUrl}/student/projects/${projectId}/apply`, payload);
  }

  listMyApplications() {
    return this.http.get<ProjectApplication[]>(`${this.baseUrl}/student/applications`);
  }

  // ── Profile ───────────────────────────────────────────
  updateProfile(payload: StudentProfileUpdateDto) {
    return this.http.put<SessionUser>(`${this.baseUrl}/student/profile`, payload);
  }

  uploadPhoto(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<SessionUser>(`${this.baseUrl}/student/profile/photo`, form);
  }

  // ── Teams ─────────────────────────────────────────────
  createTeam(payload: CreateStudentTeamDto) {
    return this.http.post<StudentTeam>(`${this.baseUrl}/student/teams`, payload);
  }

  listMyTeams() {
    return this.http.get<StudentTeam[]>(`${this.baseUrl}/student/teams/mine`);
  }

  listUniversityTeams() {
    return this.http.get<StudentTeam[]>(`${this.baseUrl}/student/teams`);
  }

  listCampusTeams() {
    return this.http.get<StudentTeam[]>(`${this.baseUrl}/student/teams/campus`);
  }

  removeMember(teamId: number, memberId: number) {
    return this.http.delete<void>(`${this.baseUrl}/student/teams/${teamId}/members/${memberId}`);
  }

  // ── Invitations ───────────────────────────────────────
  /** Leader invites a student by email */
  inviteMember(teamId: number, payload: TeamInviteDto) {
    return this.http.post<TeamInvitation>(`${this.baseUrl}/student/teams/${teamId}/invite`, payload);
  }

  /** Student requests to join a team */
  requestJoin(teamId: number, payload: TeamJoinRequestDto) {
    return this.http.post<TeamInvitation>(`${this.baseUrl}/student/teams/${teamId}/join-request`, payload);
  }

  /** Tutor requests to tutor a team */
  requestTutoring(teamId: number, payload: TeamJoinRequestDto) {
    return this.http.post<TeamInvitation>(`${this.baseUrl}/student/teams/${teamId}/tutor-request`, payload);
  }

  /** Leader invites a tutor to tutor their team */
  inviteTutor(teamId: number, payload: TeamInviteDto) {
    return this.http.post<TeamInvitation>(`${this.baseUrl}/student/teams/${teamId}/invite-tutor`, payload);
  }

  listInvitations() {
    return this.http.get<TeamInvitation[]>(`${this.baseUrl}/student/invitations`);
  }

  pendingCount() {
    return this.http.get<{ count: number }>(`${this.baseUrl}/student/invitations/pending-count`);
  }

  acceptInvitation(id: number) {
    return this.http.put<TeamInvitation>(`${this.baseUrl}/student/invitations/${id}/accept`, {});
  }

  rejectInvitation(id: number) {
    return this.http.put<TeamInvitation>(`${this.baseUrl}/student/invitations/${id}/reject`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { StudentTeam, CreateStudentTeamDto, AddTeamMemberDto, ProjectApplication, ApplyToProjectDto, StudentProfileUpdateDto } from '../../../shared/models/student.model';
import { Project } from '../../../shared/models/project.model';
import { SessionUser } from '../../../shared/models/session-user.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  listPublishedProjects() {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/published`);
  }

  applyToProject(projectId: number, payload: ApplyToProjectDto) {
    return this.http.post<ProjectApplication>(`${this.baseUrl}/student/projects/${projectId}/apply`, payload);
  }

  listMyApplications() {
    return this.http.get<ProjectApplication[]>(`${this.baseUrl}/student/applications`);
  }

  updateProfile(payload: StudentProfileUpdateDto) {
    return this.http.put<SessionUser>(`${this.baseUrl}/student/profile`, payload);
  }

  createTeam(payload: CreateStudentTeamDto) {
    return this.http.post<StudentTeam>(`${this.baseUrl}/student/teams`, payload);
  }

  listMyTeams() {
    return this.http.get<StudentTeam[]>(`${this.baseUrl}/student/teams/mine`);
  }

  listUniversityTeams() {
    return this.http.get<StudentTeam[]>(`${this.baseUrl}/student/teams`);
  }

  addMember(teamId: number, payload: AddTeamMemberDto) {
    return this.http.post<StudentTeam>(`${this.baseUrl}/student/teams/${teamId}/members`, payload);
  }

  removeMember(teamId: number, memberId: number) {
    return this.http.delete<void>(`${this.baseUrl}/student/teams/${teamId}/members/${memberId}`);
  }
}

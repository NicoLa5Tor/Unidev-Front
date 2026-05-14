import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  CreateProjectDto,
  Project,
  ProjectDetail,
  ProjectPage,
  ProjectPublishRequest,
  ProjectRequirementAssistantMessageDto,
  ProjectDevelopmentTypeOption,
  UpdateProjectRequirementDto
} from '../../../shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projectsUrl = `${environment.apiUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  createProject(payload: CreateProjectDto) {
    return this.http.post<Project>(this.projectsUrl, payload);
  }

  listDevelopmentTypes() {
    return this.http.get<ProjectDevelopmentTypeOption[]>(`${environment.apiUrl}/project-development-types`);
  }

  listProjects(page = 0, size = 3, archived = false) {
    return this.http.get<ProjectPage>(this.projectsUrl, {
      params: { page: page.toString(), size: size.toString(), archived: archived.toString() }
    });
  }

  archiveProject(id: number) {
    return this.http.patch<Project>(`${this.projectsUrl}/${id}/archive`, {});
  }

  unarchiveProject(id: number) {
    return this.http.patch<Project>(`${this.projectsUrl}/${id}/unarchive`, {});
  }

  getProject(id: number) {
    return this.http.get<ProjectDetail>(`${this.projectsUrl}/${id}`);
  }

  updateRequirement(projectId: number, requirementId: number, payload: UpdateProjectRequirementDto) {
    return this.http.put<ProjectDetail>(`${this.projectsUrl}/${projectId}/requirements/${requirementId}`, payload);
  }

  sendRequirementAssistantMessage(projectId: number, requirementId: number, payload: ProjectRequirementAssistantMessageDto) {
    return this.http.post<ProjectDetail>(`${this.projectsUrl}/${projectId}/requirements/${requirementId}/assistant/messages`, payload);
  }

  applyRequirementAssistantSuggestion(projectId: number, requirementId: number) {
    return this.http.post<ProjectDetail>(`${this.projectsUrl}/${projectId}/requirements/${requirementId}/assistant/apply`, {});
  }

  retryAi(projectId: number) {
    return this.http.post<ProjectDetail>(`${this.projectsUrl}/${projectId}/retry-ai`, {});
  }

  publishProject(projectId: number, payload: ProjectPublishRequest) {
    return this.http.post<ProjectDetail>(`${this.projectsUrl}/${projectId}/publish`, payload);
  }

}

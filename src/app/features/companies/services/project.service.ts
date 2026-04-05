import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { CreateProjectDto, Project, ProjectDetail, ProjectDevelopmentTypeOption, UpdateProjectRequirementDto } from '../../../shared/models/project.model';

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

  listProjects() {
    return this.http.get<Project[]>(this.projectsUrl);
  }

  getProject(id: number) {
    return this.http.get<ProjectDetail>(`${this.projectsUrl}/${id}`);
  }

  updateRequirement(projectId: number, requirementId: number, payload: UpdateProjectRequirementDto) {
    return this.http.put<ProjectDetail>(`${this.projectsUrl}/${projectId}/requirements/${requirementId}`, payload);
  }
}

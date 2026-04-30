import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApplicantProfile, ProjectApplication } from '../../../shared/models/project-application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly projectsUrl = `${environment.apiUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  listApplications(projectId: number): Observable<ProjectApplication[]> {
    return this.http.get<ProjectApplication[]>(`${this.projectsUrl}/${projectId}/applications`);
  }

  getApplicantProfile(projectId: number, applicationId: number): Observable<ApplicantProfile> {
    return this.http.get<ApplicantProfile>(`${this.projectsUrl}/${projectId}/applications/${applicationId}/profile`);
  }

  updateStatus(projectId: number, applicationId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<ProjectApplication> {
    return this.http.put<ProjectApplication>(
      `${this.projectsUrl}/${projectId}/applications/${applicationId}/status`,
      { status }
    );
  }
}

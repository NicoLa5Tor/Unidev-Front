import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApplicantProfile,
  ApplicationNegotiationThread,
  ProjectApplication
} from '../../../shared/models/project-application.model';

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

  getNegotiation(projectId: number, applicationId: number): Observable<ApplicationNegotiationThread> {
    return this.http.get<ApplicationNegotiationThread>(`${this.projectsUrl}/${projectId}/applications/${applicationId}/negotiation`);
  }

  sendNegotiationMessage(projectId: number, applicationId: number, payload: { message?: string | null; proposedAmount?: number | null }): Observable<ApplicationNegotiationThread> {
    return this.http.post<ApplicationNegotiationThread>(
      `${this.projectsUrl}/${projectId}/applications/${applicationId}/negotiation/messages`,
      payload
    );
  }

  acceptNegotiationProposal(projectId: number, applicationId: number, messageId: number): Observable<ApplicationNegotiationThread> {
    return this.http.post<ApplicationNegotiationThread>(
      `${this.projectsUrl}/${projectId}/applications/${applicationId}/negotiation/messages/${messageId}/accept`,
      {}
    );
  }

  updateStatus(projectId: number, applicationId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<ProjectApplication> {
    return this.http.put<ProjectApplication>(
      `${this.projectsUrl}/${projectId}/applications/${applicationId}/status`,
      { status }
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectDispute {
  id: number;
  projectId: number;
  projectName: string | null;
  requesterUserId: number | null;
  requesterDisplayName: string | null;
  requesterRole: string;
  reason: string;
  documentUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByDisplayName: string | null;
}

export interface ProjectTimeExtension {
  id: number;
  projectId: number;
  requesterUserId: number | null;
  requesterDisplayName: string | null;
  days: number;
  reason: string | null;
  createdAt: string;
}

export interface TimeExtensionsResponse {
  extensions: ProjectTimeExtension[];
  used: number;
  max: number;
}

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/disputes`;

  createDispute(projectId: number, reason: string, document: File | null): Observable<ProjectDispute> {
    const form = new FormData();
    form.append('reason', reason);
    if (document) form.append('document', document);
    return this.http.post<ProjectDispute>(`${this.baseUrl}/projects/${projectId}`, form);
  }

  listByProject(projectId: number): Observable<ProjectDispute[]> {
    return this.http.get<ProjectDispute[]>(`${this.baseUrl}/projects/${projectId}`);
  }

  listPending(): Observable<ProjectDispute[]> {
    return this.http.get<ProjectDispute[]>(`${this.baseUrl}/pending`);
  }

  resolve(id: number, decision: 'APPROVED' | 'REJECTED', adminNotes: string | null): Observable<ProjectDispute> {
    return this.http.post<ProjectDispute>(`${this.baseUrl}/${id}/resolve`, { decision, adminNotes });
  }

  requestExtension(projectId: number, days: number, reason: string | null): Observable<ProjectTimeExtension> {
    return this.http.post<ProjectTimeExtension>(`${this.baseUrl}/projects/${projectId}/extensions`, { days, reason });
  }

  listExtensions(projectId: number): Observable<TimeExtensionsResponse> {
    return this.http.get<TimeExtensionsResponse>(`${this.baseUrl}/projects/${projectId}/extensions`);
  }
}

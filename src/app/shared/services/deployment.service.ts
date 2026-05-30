import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Deployment, SubdomainCheck } from '../models/deployment.model';

@Injectable({ providedIn: 'root' })
export class DeploymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/deployments`;

  checkSubdomain(value: string): Observable<SubdomainCheck> {
    const params = new URLSearchParams({ value });
    return this.http.get<SubdomainCheck>(`${this.baseUrl}/subdomain/check?${params.toString()}`);
  }

  create(form: FormData): Observable<Deployment> {
    return this.http.post<Deployment>(this.baseUrl, form);
  }

  status(id: string): Observable<Deployment> {
    return this.http.get<Deployment>(`${this.baseUrl}/${id}/status`);
  }

  activate(id: string): Observable<Deployment> {
    return this.http.post<Deployment>(`${this.baseUrl}/${id}/activate`, {});
  }

  /** Soft delete: stops containers, frees subdomain, but record stays in trash. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Hard delete: removes the record from the trash bin. */
  permanentDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/permanent`);
  }

  listByApplication(applicationId: number): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.baseUrl}/by-application/${applicationId}`);
  }

  listTrashByApplication(applicationId: number): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.baseUrl}/by-application/${applicationId}/trash`);
  }
}

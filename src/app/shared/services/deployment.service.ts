import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDeliveryChatMessage, ApplicationDeliveryChatThread, Deployment, SubdomainCheck } from '../models/deployment.model';

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

  publish(id: string): Observable<Deployment> {
    return this.http.post<Deployment>(`${this.baseUrl}/${id}/publish`, {});
  }

  resync(id: string, port?: number | null, envFileContent?: string | null): Observable<Deployment> {
    const body: { port?: number; envFileContent?: string } = {};
    if (port != null) body.port = port;
    if (envFileContent) body.envFileContent = envFileContent;
    return this.http.post<Deployment>(`${this.baseUrl}/${id}/resync`, body);
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

  companyPendingReview(): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.baseUrl}/company/pending-review`);
  }

  batchPublish(items: { id: string; description: string }[]): Observable<Deployment[]> {
    return this.http.post<Deployment[]>(`${this.baseUrl}/batch-publish`, items);
  }

  // ── Delivery chat ───────────────────────────────────────────────────
  private readonly deliveryChatUrl = `${environment.apiUrl}/delivery-chat`;

  getDeliveryChatThread(applicationId: number): Observable<ApplicationDeliveryChatThread> {
    return this.http.get<ApplicationDeliveryChatThread>(`${this.deliveryChatUrl}/${applicationId}`);
  }

  sendDeliveryChatMessage(applicationId: number, textBody: string, deploymentId?: string | null): Observable<ApplicationDeliveryChatMessage> {
    return this.http.post<ApplicationDeliveryChatMessage>(
      `${this.deliveryChatUrl}/${applicationId}/messages`,
      { textBody, deploymentId: deploymentId ?? null }
    );
  }

  sendDeliveryChatAttachment(applicationId: number, file: File, textBody?: string, deploymentId?: string | null): Observable<ApplicationDeliveryChatMessage> {
    const form = new FormData();
    form.append('file', file);
    if (textBody) form.append('textBody', textBody);
    if (deploymentId) form.append('deploymentId', deploymentId);
    return this.http.post<ApplicationDeliveryChatMessage>(
      `${this.deliveryChatUrl}/${applicationId}/attachments`,
      form
    );
  }
}

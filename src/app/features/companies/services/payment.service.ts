import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CheckoutResponse, ProjectPaymentResponse } from '../../../shared/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly paymentsUrl = `${environment.apiUrl}/payments`;
  private readonly mpUrl = `${environment.apiUrl}/mp`;

  constructor(private readonly http: HttpClient) {}

  createCheckout(projectId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.paymentsUrl}/projects/${projectId}/checkout`, {});
  }

  getPaymentStatus(projectId: number): Observable<ProjectPaymentResponse | null> {
    return this.http.get<ProjectPaymentResponse>(`${this.paymentsUrl}/projects/${projectId}`);
  }

  releasePayment(projectId: number): Observable<ProjectPaymentResponse> {
    return this.http.post<ProjectPaymentResponse>(`${this.paymentsUrl}/projects/${projectId}/release`, {});
  }

  // MP OAuth — equipo
  initTeamConnect(teamId: number): Observable<{ teamId: number; authUrl: string | null; status: string }> {
    return this.http.post<{ teamId: number; authUrl: string | null; status: string }>(
      `${this.mpUrl}/teams/${teamId}/connect`, {}
    );
  }

  getTeamConnectStatus(teamId: number): Observable<{ teamId: number; status: string; mpUserId: string | null; connectedAt: string | null }> {
    return this.http.get<{ teamId: number; status: string; mpUserId: string | null; connectedAt: string | null }>(
      `${this.mpUrl}/teams/${teamId}/connect/status`
    );
  }

  disconnectTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.mpUrl}/teams/${teamId}/connect`);
  }

  // MP OAuth — individual
  initUserConnect(): Observable<{ teamId: number; authUrl: string | null; status: string }> {
    return this.http.post<{ teamId: number; authUrl: string | null; status: string }>(
      `${this.mpUrl}/me/connect`, {}
    );
  }

  getUserConnectStatus(): Observable<{ teamId: number; status: string; mpUserId: string | null; connectedAt: string | null }> {
    return this.http.get<{ teamId: number; status: string; mpUserId: string | null; connectedAt: string | null }>(
      `${this.mpUrl}/me/connect/status`
    );
  }

  disconnectUser(): Observable<void> {
    return this.http.delete<void>(`${this.mpUrl}/me/connect`);
  }
}

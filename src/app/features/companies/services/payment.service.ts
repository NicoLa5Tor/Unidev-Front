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

  constructor(private readonly http: HttpClient) {}

  createCheckout(projectId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.paymentsUrl}/projects/${projectId}/checkout`, {});
  }

  getPaymentStatus(projectId: number): Observable<ProjectPaymentResponse | null> {
    return this.http.get<ProjectPaymentResponse>(`${this.paymentsUrl}/projects/${projectId}`);
  }
}

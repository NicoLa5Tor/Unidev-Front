import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  Company,
  CompanyOtpFlowResponseDto,
  CompanyOtpRequestDto,
  CompanyOtpVerifyDto,
  CreateCompanyDto,
  Plan
} from '../../../shared/models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly companiesUrl = `${environment.apiUrl}/companies`;
  private readonly companyRegistrationUrl = `${environment.apiUrl}/company-registration`;
  private readonly plansUrl = `${environment.apiUrl}/plans`;

  constructor(private readonly http: HttpClient) {}

  getPlans() {
    return this.http.get<Plan[]>(this.plansUrl);
  }

  getCompanies() {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  getCompany(companyId: number) {
    return this.http.get<Company>(`${this.companiesUrl}/${companyId}`);
  }

  createCompany(payload: CreateCompanyDto) {
    return this.http.post<Company>(this.companiesUrl, payload);
  }

  requestCompanyOtp(payload: CompanyOtpRequestDto) {
    return this.http.post<CompanyOtpFlowResponseDto>(`${this.companyRegistrationUrl}/otp/request`, payload);
  }

  verifyCompanyOtp(payload: CompanyOtpVerifyDto) {
    return this.http.post<{ message: string }>(`${this.companyRegistrationUrl}/otp/verify`, payload);
  }

  updateCompany(companyId: number, payload: CreateCompanyDto) {
    return this.http.put<Company>(`${this.companiesUrl}/${companyId}`, payload);
  }
}

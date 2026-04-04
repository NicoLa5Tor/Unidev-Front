import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  Company,
  CompanyRegistrationDocument,
  CompanyOtpFlowResponseDto,
  CompanyOtpRequestDto,
  CompanyOtpVerifyDto,
  CreateCompanyDto,
  UpdateCompanyProfileDto,
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

  uploadRegistrationDocument(
    email: string,
    companyName: string,
    documentType: 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT',
    file: File
  ) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('companyName', companyName);
    formData.append('documentType', documentType);
    formData.append('file', file);
    return this.http.post<CompanyRegistrationDocument>(`${this.companyRegistrationUrl}/documents`, formData);
  }

  listRegistrationDocuments(email: string) {
    return this.http.get<CompanyRegistrationDocument[]>(`${this.companyRegistrationUrl}/documents`, {
      params: { email }
    });
  }

  listRegistrationDocumentsByCompany(companyId: number) {
    return this.http.get<CompanyRegistrationDocument[]>(`${this.companyRegistrationUrl}/documents`, {
      params: { companyId }
    });
  }

  downloadRegistrationDocument(documentId: number) {
    return `${environment.apiUrl}/company-registration/documents/${documentId}/download`;
  }

  updateCompany(companyId: number, payload: CreateCompanyDto) {
    return this.http.put<Company>(`${this.companiesUrl}/${companyId}`, payload);
  }

  updateCompanyProfile(payload: UpdateCompanyProfileDto) {
    return this.http.put<Company>(`${this.companiesUrl}/profile`, payload);
  }

  uploadCompanyProfileLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Company>(`${this.companiesUrl}/profile/logo`, formData);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { Company, CreateCompanyDto, Plan } from '../../../shared/models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly companiesUrl = `${environment.apiUrl}/companies`;
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

  updateCompany(companyId: number, payload: CreateCompanyDto) {
    return this.http.put<Company>(`${this.companiesUrl}/${companyId}`, payload);
  }
}

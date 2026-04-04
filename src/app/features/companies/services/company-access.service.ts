import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  CompanyAllowedEmail,
  CreateCompanyUserDto,
} from '../../../shared/models/company-access.model';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyAccessService {
  private readonly allowedEmailsUrl = `${environment.apiUrl}/company-allowed-emails`;
  private readonly companyUsersUrl = `${environment.apiUrl}/company-users`;

  constructor(private readonly http: HttpClient) {}

  listAllowedEmails() {
    return this.http.get<CompanyAllowedEmail[]>(this.allowedEmailsUrl);
  }

  addAllowedEmail(email: string) {
    return this.http.post<CompanyAllowedEmail>(this.allowedEmailsUrl, { email });
  }

  removeAllowedEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.delete<void>(this.allowedEmailsUrl, { params });
  }

  listCompanyUsers() {
    return this.http.get<User[]>(this.companyUsersUrl);
  }

  createCompanyUser(payload: CreateCompanyUserDto) {
    return this.http.post<User>(this.companyUsersUrl, payload);
  }
}

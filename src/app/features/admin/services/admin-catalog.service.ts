import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CompanyOption } from '../../../shared/models/company.model';
import { RoleOption } from '../../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCatalogService {
  private readonly rolesUrl = `${environment.apiUrl}/roles`;
  private readonly companiesUrl = `${environment.apiUrl}/companies`;

  constructor(private readonly http: HttpClient) {}

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(this.rolesUrl);
  }

  getCompanies(): Observable<CompanyOption[]> {
    return this.http.get<CompanyOption[]>(this.companiesUrl);
  }
}

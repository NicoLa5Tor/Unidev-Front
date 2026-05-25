import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pqrs, PqrsReplyRequest, PqrsRequest } from '../models/pqrs.model';

@Injectable({ providedIn: 'root' })
export class PqrsService {
  private readonly url = `${environment.apiUrl}/pqrs`;

  constructor(private readonly http: HttpClient) {}

  create(request: PqrsRequest): Observable<Pqrs> {
    return this.http.post<Pqrs>(this.url, request);
  }

  mine(): Observable<Pqrs[]> {
    return this.http.get<Pqrs[]>(`${this.url}/mine`);
  }

  listAll(status?: string): Observable<Pqrs[]> {
    const params: Record<string, string> = status ? { status } : {};
    return this.http.get<Pqrs[]>(this.url, { params });
  }

  findById(id: number): Observable<Pqrs> {
    return this.http.get<Pqrs>(`${this.url}/${id}`);
  }

  reply(id: number, request: PqrsReplyRequest): Observable<Pqrs> {
    return this.http.put<Pqrs>(`${this.url}/${id}/reply`, request);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Announcement, AnnouncementRequest } from '../../../shared/models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly url = `${environment.apiUrl}/announcements`;

  constructor(private readonly http: HttpClient) {}

  listAll(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.url);
  }

  inbox(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.url}/inbox`);
  }

  send(request: AnnouncementRequest): Observable<Announcement> {
    return this.http.post<Announcement>(this.url, request);
  }
}

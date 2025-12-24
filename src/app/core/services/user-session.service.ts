import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { SessionUser } from '../../shared/models/session-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private readonly apiUrl = `${environment.apiUrl}/users/me`;
  private readonly currentUserSubject = new BehaviorSubject<SessionUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCurrentUser(force = false): Observable<SessionUser | null> {
    if (!force && this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    return this.http.get<ApiResponse<SessionUser> | SessionUser | string>(this.apiUrl).pipe(
      map(response => {
        if (typeof response === 'string') {
          try {
            return JSON.parse(response) as SessionUser;
          } catch {
            return null;
          }
        }

        if (response && typeof response === 'object' && 'success' in response) {
          const apiResponse = response as ApiResponse<SessionUser>;
          return apiResponse.success ? apiResponse.data ?? null : null;
        }
        return response as SessionUser;
      }),
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  clear(): void {
    this.currentUserSubject.next(null);
  }
}

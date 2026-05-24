import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../../../shared/models/user.model';
import { SessionUser } from '../../../shared/models/session-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  acceptStudentConsent(): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${this.apiUrl}/me/accept-consent`, {});
  }

  verifyStudentAge(birthDate: string): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${this.apiUrl}/me/verify-age`, { birthDate });
  }

  verifyCedula(cedula: string): Observable<SessionUser> {
    return this.http.post<SessionUser>(`${this.apiUrl}/me/verify-cedula`, { cedula });
  }
}

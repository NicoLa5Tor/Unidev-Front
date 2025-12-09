import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if token exists in localStorage on service initialization
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<any> {
    // TODO: Implement actual login logic with HTTP client
    // This is a placeholder implementation
    console.log('Login attempt:', { email, password });
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        const mockToken = 'mock-jwt-token';
        localStorage.setItem('token', mockToken);
        this.isAuthenticatedSubject.next(true);
        observer.next({ token: mockToken });
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
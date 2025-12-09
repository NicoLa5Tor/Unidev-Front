import { Injectable } from '@angular/core';
import { fetchAuthSession, getCurrentUser, signIn, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type FederatedProvider = 'google' | 'apple' | 'microsoft';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.hydrateAuthState();
  }

  login(email: string, password: string): Observable<void> {
    return from(
      signIn({
        username: email,
        password
      })
    ).pipe(
      tap(() => this.updateAuthState(true)),
      map(() => void 0)
    );
  }

  federatedSignIn(provider: FederatedProvider): void {
    if (provider === 'google') {
      signInWithRedirect({ provider: 'Google' });
      return;
    }

    if (provider === 'apple') {
      signInWithRedirect({ provider: 'Apple' });
      return;
    }

    signInWithRedirect({ provider: { custom: 'Microsoft' } });
  }

  logout(): Observable<void> {
    return from(signOut()).pipe(
      tap(() => this.updateAuthState(false)),
      map(() => void 0)
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken?.toString() ?? null;
    } catch (error) {
      this.updateAuthState(false);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private hydrateAuthState(): void {
    getCurrentUser()
      .then(() => this.updateAuthState(true))
      .catch(() => this.updateAuthState(false));
  }

  private updateAuthState(isAuthenticated: boolean): void {
    if (this.isAuthenticatedSubject.value !== isAuthenticated) {
      this.isAuthenticatedSubject.next(isAuthenticated);
    }
  }

}

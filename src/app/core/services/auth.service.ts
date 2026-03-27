import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticatedResult, LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserSessionService } from './user-session.service';

export type FederatedProvider = 'google' | 'microsoft';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly http = inject(HttpClient);
  private readonly userSessionService = inject(UserSessionService);
  private readonly identityProviders: Partial<Record<FederatedProvider, string>> =
    environment.auth?.identityProviders ?? {};
  readonly isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
    map((result: AuthenticatedResult) => result.isAuthenticated)
  );
  readonly userData$ = this.oidcSecurityService.userData$;

  login(): void {
    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        prompt: 'select_account'
      }
    });
  }

  federatedSignIn(provider: FederatedProvider): void {
    const identityProvider = this.identityProviders[provider];

    if (!identityProvider) {
      console.error(`No se encontró un identity_provider configurado para '${provider}'.`);
      this.login();
      return;
    }

    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        identity_provider: identityProvider,
        prompt: 'select_account'
      }
    });
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, null, {
          withCredentials: true
        })
      );
    } catch {
      // Even if the backend logout fails, continue with provider logout.
    }

    this.clearClientSession();

    const { clientId, postLogoutRedirectUri, cognitoDomain } = environment.auth.oidc;
    const url = new URL('/logout', cognitoDomain);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('logout_uri', postLogoutRedirectUri);

    window.location.href = url.toString();
  }

  ensureAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.checkAuth().pipe(map((result: LoginResponse) => result.isAuthenticated));
  }

  private clearClientSession(): void {
    this.userSessionService.clear();
    this.oidcSecurityService.logoffLocal();

    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.clear();

    const keysToDelete = Object.keys(window.localStorage).filter(key =>
      key === 'microsoft-bypass' ||
      key.startsWith('authorizationResult') ||
      key.startsWith('authnResult') ||
      key.startsWith('reusable_route') ||
      key.includes('authWellKnown') ||
      key.includes('userData') ||
      key.includes('codeVerifier') ||
      key.includes('storageCodeFlow')
    );

    keysToDelete.forEach(key => window.localStorage.removeItem(key));
  }
}

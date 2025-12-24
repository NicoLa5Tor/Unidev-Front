import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticatedResult, LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type FederatedProvider = 'google' | 'microsoft';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly http = inject(HttpClient);
  private readonly identityProviders: Partial<Record<FederatedProvider, string>> =
    environment.auth?.identityProviders ?? {};
  readonly isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
    map((result: AuthenticatedResult) => result.isAuthenticated)
  );
  readonly userData$ = this.oidcSecurityService.userData$;

  login(): void {
    this.oidcSecurityService.authorize();
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
        identity_provider: identityProvider
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

    const { clientId, postLogoutRedirectUri, cognitoDomain } = environment.auth.oidc;
    const url = new URL('/logout', cognitoDomain);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('logout_uri', postLogoutRedirectUri);

    window.location.href = url.toString();
  }

  ensureAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.checkAuth().pipe(map((result: LoginResponse) => result.isAuthenticated));
  }

}

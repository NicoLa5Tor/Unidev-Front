import { Injectable, inject } from '@angular/core';
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

  logout(): void {
    const { clientId, postLogoutRedirectUri, cognitoDomain } = environment.auth.oidc;
    const url = new URL('/logout', cognitoDomain);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('logout_uri', postLogoutRedirectUri);

    window.location.href = url.toString();
  }

  async getToken(): Promise<string | null> {
    try {
      return await firstValueFrom(this.oidcSecurityService.getAccessToken());
    } catch {
      return null;
    }
  }

  ensureAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.checkAuth().pipe(map((result: LoginResponse) => result.isAuthenticated));
  }

}

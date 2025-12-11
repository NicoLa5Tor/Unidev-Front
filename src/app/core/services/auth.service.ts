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
  readonly isAuthenticated$ = this.oidcSecurityService.isAuthenticated$.pipe(
    map((result: AuthenticatedResult) => result.isAuthenticated)
  );
  readonly userData$ = this.oidcSecurityService.userData$;

  login(): void {
    this.oidcSecurityService.authorize();
  }

  federatedSignIn(provider: FederatedProvider): void {
    const identityProvider = provider === 'google' ? 'Google' : 'AzureAD';

    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        identity_provider: identityProvider
      }
    });
  }

  logout(): Observable<void> {
    const { clientId, postLogoutRedirectUri } = environment.auth.oidc;

    return this.oidcSecurityService
      .logoff(undefined, {
        customParams: {
          client_id: clientId,
          logout_uri: postLogoutRedirectUri
        }
      })
      .pipe(map(() => void 0));
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

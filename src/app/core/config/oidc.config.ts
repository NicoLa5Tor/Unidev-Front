import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
import { environment } from '../../../environments/environment';

export function provideOidcClient(): EnvironmentProviders {
  const { authority, clientId, redirectUrl, postLogoutRedirectUri, scope, responseType } = environment.auth.oidc;

  return importProvidersFrom(
    AuthModule.forRoot({
      config: {
        authority,
        redirectUrl,
        postLoginRoute: new URL(redirectUrl).pathname || '/callback',
        postLogoutRedirectUri,
        triggerAuthorizationResultEvent: true,
        clientId,
        scope,
        responseType,
        customParamsEndSessionRequest: {
          client_id: clientId
        },
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Error
      }
    })
  );
}

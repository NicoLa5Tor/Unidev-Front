import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractSecurityStorage, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { MicrosoftAccessService } from '../../../../core/services/microsoft-access.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-teal-400/20 blur-3xl"></div>
      </div>

      <div class="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16">
        <div class="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
          <ng-container *ngIf="isInvitationFlow; else authCallback">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.4em] text-purple-200">Invitación</p>
                <p class="text-3xl font-semibold">Validando invitación</p>
              </div>
              <span class="rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-purple-200">
                Paso 1
              </span>
            </div>
            <div class="mt-6 bg-black/40 border border-white/10 rounded-2xl p-6 text-center" *ngIf="!invitationError">
              <div class="mx-auto h-12 w-12 rounded-full border-2 border-white/30 border-t-rose-400 animate-spin" aria-hidden="true"></div>
              <p class="mt-4 text-purple-200">{{ invitationStatus }}</p>
            </div>
            <p *ngIf="invitationError" class="mt-6 text-rose-300 font-medium text-center">{{ invitationError }}</p>
          </ng-container>

          <ng-template #authCallback>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.4em] text-purple-200">Callback</p>
                <p class="text-3xl font-semibold">Revisando autenticación</p>
              </div>
              <span
                class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em]"
                [ngClass]="{
                  'border-emerald-400/40 text-emerald-300': isAuthenticated && !error,
                  'border-rose-400/40 text-rose-200': !!error
                }"
              >
                {{ error ? 'Error' : isAuthenticated ? 'Autenticado' : 'Procesando' }}
              </span>
            </div>

            <div class="mt-6">
              <div *ngIf="isLoading" class="bg-black/40 border border-white/10 rounded-2xl p-6 text-center">
                <div class="mx-auto h-12 w-12 rounded-full border-2 border-white/30 border-t-emerald-300 animate-spin" aria-hidden="true"></div>
                <p class="mt-4 text-purple-200">{{ statusMessage }}</p>
              </div>

              <div *ngIf="!isLoading">
                <p *ngIf="error" class="text-rose-300 font-medium">
                  {{ error }}
                </p>

                <div *ngIf="lastPayload" class="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
                  <p class="uppercase tracking-[0.3em] text-purple-200">Payload enviado</p>
                  <pre class="mt-2 whitespace-pre-wrap break-all text-slate-100">{{ lastPayload }}</pre>
                </div>
                <div *ngIf="lastResponse" class="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
                  <p class="uppercase tracking-[0.3em] text-purple-200">Respuesta del backend</p>
                  <pre class="mt-2 whitespace-pre-wrap break-all text-slate-100">{{ lastResponse }}</pre>
                </div>
                <div *ngIf="debugInfo" class="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
                  <p class="uppercase tracking-[0.3em] text-purple-200">Debug</p>
                  <pre class="mt-2 whitespace-pre-wrap break-all text-slate-100">{{ debugInfo }}</pre>
                </div>

                <ng-container *ngIf="!error">
                  <p *ngIf="isAuthenticated" class="text-emerald-300 font-medium">Sesión validada. Revisando datos...</p>
                  <p *ngIf="fetchUserStatus === 401" class="text-amber-300 font-medium mt-2">
                    La sesión no está disponible en /users/me (401). Revisa cookies y CORS.
                  </p>
                  <p class="text-sm text-purple-200/80 mt-4">
                    Ya puedes continuar en UniDev. Si no ocurre nada en unos segundos, usa los accesos rápidos.
                  </p>
                </ng-container>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <a
                routerLink="/"
                class="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/10"
              >
                Ir al inicio
              </a>
              <a
                routerLink="/login"
                class="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Volver al login
              </a>
            </div>
          </ng-template>
        </div>
      </div>
    </section>
  `
})
export class CallbackComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly microsoftAccessService = inject(MicrosoftAccessService);
  private readonly authService = inject(AuthService);
  private readonly securityStorage = inject(AbstractSecurityStorage);
  private readonly http = inject(HttpClient);

  error = '';
  isLoading = true;
  isAuthenticated = false;
  invitationCode: string | null = null;
  invitationStatus = 'Confirmando con UniDev...';
  invitationError = '';
  isInvitationFlow = false;
  statusMessage = 'Procesando respuesta de Cognito y validando acceso...';
  lastPayload = '';
  lastResponse = '';
  debugInfo = '';
  fetchUserStatus: number | null = null;
  private isBypassRedirect = false;
  private readonly redirectPath = '/';
  private readonly redirectDelayMs = 1200;
  private readonly loginPath = '/login';
  private oidcConfig: OpenIdConfiguration | null = null;

  async ngOnInit(): Promise<void> {
    const invitationCode = this.activatedRoute.snapshot.queryParamMap.get('invitate');
    if (invitationCode) {
      this.isInvitationFlow = true;
      this.invitationCode = invitationCode;
      this.isLoading = false;
      this.processInvitation(invitationCode);
      return;
    }

    try {
      const providerError = this.getProviderError();

      if (providerError) {
        this.error = `Error reportado por el proveedor: ${providerError}`;
        return;
      }

      const code = this.activatedRoute.snapshot.queryParamMap.get('code');

      if (!code) {
        this.error = 'No encontramos el código de autorización. Intenta iniciar sesión nuevamente.';
        return;
      }

      const codeVerifier = await this.getCodeVerifier();
      if (!codeVerifier) {
        this.error = 'No encontramos el verificador PKCE. Vuelve a iniciar sesión.';
        return;
      }

      this.statusMessage = 'Validando con UniDev...';
      await this.exchangeAuthorizationCode(code, codeVerifier);

      try {
        await this.fetchCurrentUser();
        this.fetchUserStatus = 200;
      } catch (fetchError) {
        const httpError = fetchError as HttpErrorResponse | undefined;
        this.fetchUserStatus = httpError?.status ?? null;
        this.debugInfo = JSON.stringify(
          {
            fetchUserStatus: httpError?.status ?? null,
            fetchUserStatusText: httpError?.statusText ?? null,
            fetchUserError: httpError?.error ?? null,
            fetchUserMessage: fetchError instanceof Error ? fetchError.message : null
          },
          null,
          2
        );
      }

      this.isAuthenticated = true;
      this.error = '';
      this.statusMessage = 'Callback completado. Puedes revisar la respuesta aquí.';
    } catch (error) {
      if (error instanceof Error && error.message === 'BYPASS_REDIRECT') {
        return;
      }
      if (error instanceof HttpErrorResponse) {
        const statusLine = `${error.status || '0'} ${error.statusText || 'Error'}`.trim();
        const backendMessage =
          typeof error.error === 'string'
            ? error.error
            : typeof error.error?.message === 'string'
              ? error.error.message
              : '';
        this.error = `Error al validar la sesión (${statusLine}). ${backendMessage}`.trim();
        this.lastResponse = JSON.stringify(
          {
            status: error.status,
            statusText: error.statusText,
            error: error.error ?? null
          },
          null,
          2
        );
      } else {
        this.error = error instanceof Error ? error.message : 'Ocurrió un error al validar la sesión.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  private getProviderError(): string | null {
    const params = this.activatedRoute.snapshot.queryParamMap;
    return params.get('error_description') ?? params.get('error');
  }

  private async getCodeVerifier(): Promise<string | null> {
    if (!this.oidcConfig) {
      this.oidcConfig = await firstValueFrom(this.oidcSecurityService.getConfiguration());
    }

    if (!this.oidcConfig) {
      return null;
    }

    const storedConfig = this.readStoredConfig(this.oidcConfig);
    this.debugInfo = JSON.stringify(
      {
        configId: this.oidcConfig?.configId ?? null,
        redirectUrl: this.oidcConfig?.redirectUrl ?? null,
        redirectUriEnv: environment.auth?.oidc?.redirectUrl ?? null,
        hasStoredConfig: !!storedConfig,
        storedConfigKeys: storedConfig ? Object.keys(storedConfig) : []
      },
      null,
      2
    );
    const codeVerifier = storedConfig?.['codeVerifier'];

    return typeof codeVerifier === 'string' ? codeVerifier : null;
  }

  private async exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<void> {
    this.lastPayload = JSON.stringify({ code, codeVerifier }, null, 2);
    try {
      const response = await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/auth/callback`,
          {
            code,
            codeVerifier
          },
          {
            observe: 'response',
            responseType: 'text'
          }
        )
      );
      this.lastResponse = JSON.stringify(
        {
          status: response.status,
          statusText: response.statusText
        },
        null,
        2
      );
      if (this.shouldBypassFromResponse(response)) {
        this.isBypassRedirect = true;
        this.persistMicrosoftBypass();
        this.authService.federatedSignIn('microsoft');
        throw new Error('BYPASS_REDIRECT');
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      const responsePayload = httpError?.error ?? httpError?.message ?? null;
      this.lastResponse = JSON.stringify(responsePayload, null, 2);
      if (this.shouldBypassMicrosoftDialog(error)) {
        this.isBypassRedirect = true;
        this.persistMicrosoftBypass();
        void this.router.navigateByUrl(this.loginPath);
        throw new Error('BYPASS_REDIRECT');
      }
      throw error;
    }

    this.removeStoredConfigKey(this.oidcConfig, 'codeVerifier');
  }

  private async fetchCurrentUser(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/users/me`, {
        observe: 'response',
        responseType: 'text'
      })
    );
    this.lastResponse = JSON.stringify(
      {
        status: response.status,
        statusText: response.statusText,
        body: response.body ?? null
      },
      null,
      2
    );
  }

  private scheduleRedirect(): void {
    setTimeout(() => {
      void this.router.navigateByUrl(this.redirectPath);
    }, this.redirectDelayMs);
  }

  private processInvitation(token: string): void {
    this.invitationStatus = 'Confirmando con UniDev...';
    this.microsoftAccessService.deactivateInvitation(token).subscribe({
      next: () => {
        this.invitationStatus = 'Invitación confirmada. Redirigiendo a Microsoft...';
        this.persistMicrosoftBypass();
        this.authService.federatedSignIn('microsoft');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error desactivando invitación', error);
        this.invitationError =
          error.error?.message || 'No pudimos validar esta invitación. Intenta generar una nueva desde UniDev.';
      }
    });
  }

  private persistMicrosoftBypass(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('microsoft-bypass', 'true');
  }

  private shouldBypassMicrosoftDialog(error: unknown): boolean {
    const httpError = error as HttpErrorResponse | undefined;
    const messageCandidates = [
      typeof httpError?.error === 'string' ? httpError.error : null,
      typeof httpError?.error?.message === 'string' ? httpError.error.message : null,
      typeof httpError?.message === 'string' ? httpError.message : null
    ];

    return messageCandidates.some(message =>
      message ? message.toLowerCase().includes('ya está registrado') : false
    );
  }

  private shouldBypassFromResponse(response: unknown): boolean {
    const status = (response as { status?: string } | null)?.status;
    return status === 'EXIST' || status === 'EXISTS';
  }

  private readStoredConfig(config: OpenIdConfiguration | null): Record<string, unknown> | null {
    const configId = config?.configId;
    if (!configId) {
      return null;
    }

    const rawValue = this.securityStorage.read(configId);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private removeStoredConfigKey(config: OpenIdConfiguration | null, key: string): void {
    const configId = config?.configId;
    if (!configId) {
      return;
    }

    const storedConfig = this.readStoredConfig(config);
    if (!storedConfig || !(key in storedConfig)) {
      return;
    }

    delete storedConfig[key];
    this.securityStorage.write(configId, JSON.stringify(storedConfig));
  }
}

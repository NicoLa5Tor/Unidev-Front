import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractSecurityStorage, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { MicrosoftAccessService } from '../../../../core/services/microsoft-access.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-teal-400/20 blur-3xl"></div>
      </div>

      <div class="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16">
        <div class="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-10 shadow-2xl backdrop-blur">
          <ng-container *ngIf="isInvitationFlow; else authCallback">
            <p class="text-xs uppercase tracking-[0.4em] text-purple-200">Invitación</p>
            <h1 class="mt-2 text-3xl font-semibold">Validando invitación</h1>
            <div class="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
              <div class="mx-auto h-12 w-12 rounded-full border-2 border-white/30 border-t-rose-400 animate-spin" aria-hidden="true"></div>
              <p class="mt-4 text-purple-200">{{ invitationStatus }}</p>
              <p *ngIf="invitationError" class="mt-4 text-rose-300 font-medium">{{ invitationError }}</p>
            </div>
          </ng-container>

          <ng-template #authCallback>
            <p class="text-xs uppercase tracking-[0.4em] text-purple-200">Callback</p>
            <h1 class="mt-2 text-3xl font-semibold">Preparando tu sesión</h1>
            <div class="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
              <div class="mx-auto h-12 w-12 rounded-full border-2 border-white/30 border-t-emerald-300 animate-spin" aria-hidden="true"></div>
              <p class="mt-4 text-purple-200">{{ statusMessage }}</p>
              <p *ngIf="error" class="mt-4 text-rose-300 font-medium">{{ error }}</p>
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
  private readonly userSessionService = inject(UserSessionService);

  error = '';
  invitationCode: string | null = null;
  invitationStatus = 'Confirmando con UniDev...';
  invitationError = '';
  isInvitationFlow = false;
  statusMessage = 'Procesando respuesta de Cognito y validando acceso...';
  private readonly roleRedirects: Record<string, string> = {
    USUARIOS: '/users'
  };
  private isBypassRedirect = false;
  private readonly redirectDelayMs = 1200;
  private readonly loginPath = '/login';
  private oidcConfig: OpenIdConfiguration | null = null;

  async ngOnInit(): Promise<void> {
    const invitationCode = this.activatedRoute.snapshot.queryParamMap.get('invitate');
    if (invitationCode) {
      this.isInvitationFlow = true;
      this.invitationCode = invitationCode;
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
      this.statusMessage = 'Recuperando tu sesión...';
      const sessionUser = await this.fetchCurrentUser();

      this.error = '';
      this.statusMessage = 'Redirigiendo a tu panel...';
      this.redirectByRole(sessionUser?.roleName);
    } catch (error) {
      if (error instanceof Error && error.message === 'BYPASS_REDIRECT') {
        return;
      }
      this.error = error instanceof Error ? error.message : 'Ocurrió un error al validar la sesión.';
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
    const codeVerifier = storedConfig?.['codeVerifier'];

    return typeof codeVerifier === 'string' ? codeVerifier : null;
  }

  private async exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<void> {
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
      if (this.shouldBypassFromResponse(response)) {
        this.isBypassRedirect = true;
        this.persistMicrosoftBypass();
        this.authService.federatedSignIn('microsoft');
        throw new Error('BYPASS_REDIRECT');
      }
    } catch (error) {
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

  private async fetchCurrentUser(): Promise<{ roleName?: string } | null> {
    return await firstValueFrom(this.userSessionService.loadCurrentUser(true));
  }

  private redirectByRole(roleName?: string): void {
    const target = (roleName && this.roleRedirects[roleName]) || '/';
    setTimeout(() => {
      void this.router.navigateByUrl(target);
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

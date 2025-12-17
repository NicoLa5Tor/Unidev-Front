import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticatedResult, LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { MicrosoftAccessService } from '../../../../core/services/microsoft-access.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div class="max-w-3xl w-full bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <ng-container *ngIf="isInvitationFlow; else authCallback">
          <p class="text-2xl font-semibold">Validando invitación</p>
          <p class="text-sm text-slate-200/80">Token: {{ invitateCode }}</p>
          <div class="bg-black/40 border border-white/10 rounded-2xl p-6 text-center" *ngIf="!invitationError">
            <div class="mx-auto h-12 w-12 rounded-full border-2 border-white/30 border-t-rose-400 animate-spin" aria-hidden="true"></div>
            <p class="mt-4 text-purple-200">{{ invitationStatus }}</p>
          </div>
          <p *ngIf="invitationError" class="text-rose-300 font-medium text-center">{{ invitationError }}</p>
        </ng-container>
        <ng-template #authCallback>
          <p class="text-2xl font-semibold">Callback de autenticación</p>

          <p *ngIf="isLoading" class="text-lg">Procesando respuesta de Cognito y validando acceso...</p>

          <div *ngIf="!isLoading">
            <p *ngIf="error" class="text-rose-300 font-medium">
              {{ error }}
            </p>

            <ng-container *ngIf="!error">
              <p *ngIf="isAuthenticated" class="text-green-400 font-medium">¡Autenticación completada con éxito!</p>
              <p class="text-sm text-purple-200/80 mt-4">Datos de la sesión:</p>
              <div class="space-y-4 text-xs font-mono bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <div>
                  <p class="text-purple-300 mb-1">ID Token</p>
                  <pre class="whitespace-pre-wrap break-all">{{ idTokenPreview }}</pre>
                </div>
                <div>
                  <p class="text-purple-300 mb-1">Access Token</p>
                  <pre class="whitespace-pre-wrap break-all">{{ accessTokenPreview }}</pre>
                </div>
                <div>
                  <p class="text-purple-300 mb-1">userData</p>
                  <pre class="whitespace-pre-wrap break-all">{{ userData | json }}</pre>
                </div>
              </div>
            </ng-container>
          </div>
        </ng-template>
      </div>
    </section>
  `
})
export class CallbackComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly microsoftAccessService = inject(MicrosoftAccessService);
  private readonly authService = inject(AuthService);

  idTokenPreview = 'No disponible';
  accessTokenPreview = 'No disponible';
  userData: unknown = null;
  error = '';
  isLoading = true;
  isAuthenticated = false;
  invitateCode: string | null = null;
  invitationStatus = 'Confirmando con UniDev...';
  invitationError = '';
  isInvitationFlow = false;

  async ngOnInit(): Promise<void> {
    const invitationCode = this.activatedRoute.snapshot.queryParamMap.get('invitate');
    if (invitationCode) {
      this.isInvitationFlow = true;
      this.invitateCode = invitationCode;
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

      if (this.hasAuthorizationCode()) {
        const { isAuthenticated, userData } = await firstValueFrom<LoginResponse>(
          this.oidcSecurityService.checkAuth()
        );

        if (!isAuthenticated) {
          this.error = 'No fue posible validar tu sesión. Intenta iniciar sesión nuevamente.';
          return;
        }

        this.isAuthenticated = true;
        this.userData = userData;
      } else {
        const sessionState = await firstValueFrom<AuthenticatedResult>(this.oidcSecurityService.isAuthenticated$);

        if (!sessionState.isAuthenticated) {
          this.error = 'Tu sesión no está activa. Por favor vuelve a iniciar sesión.';
          return;
        }

        this.isAuthenticated = true;
        this.userData = await firstValueFrom(this.oidcSecurityService.userData$);
      }

      const [idToken, accessToken] = await Promise.all([
        firstValueFrom<string>(this.oidcSecurityService.getIdToken()),
        firstValueFrom<string>(this.oidcSecurityService.getAccessToken())
      ]);

      this.idTokenPreview = idToken || 'No disponible';
      this.accessTokenPreview = accessToken || 'No disponible';
      this.error = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ocurrió un error al validar la sesión.';
    } finally {
      this.isLoading = false;
    }
  }

  private getProviderError(): string | null {
    const params = this.activatedRoute.snapshot.queryParamMap;
    return params.get('error_description') ?? params.get('error');
  }

  private hasAuthorizationCode(): boolean {
    return this.activatedRoute.snapshot.queryParamMap.has('code');
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
}

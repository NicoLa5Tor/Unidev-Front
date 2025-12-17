import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthenticatedResult, LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div class="max-w-3xl w-full bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <ng-container *ngIf="invitateCode; else authCallback">
          <p class="text-2xl font-semibold">Invitación recibida</p>
          <p class="text-sm text-slate-200/80">Comparte este identificador para continuar con la activación:</p>
          <div class="bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-center text-lg tracking-widest text-rose-200 break-all">
            {{ invitateCode }}
          </div>
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

  idTokenPreview = 'No disponible';
  accessTokenPreview = 'No disponible';
  userData: unknown = null;
  error = '';
  isLoading = true;
  isAuthenticated = false;
  invitateCode: string | null = null;

  async ngOnInit(): Promise<void> {
    const invitationCode = this.activatedRoute.snapshot.queryParamMap.get('invitate');
    if (invitationCode) {
      this.invitateCode = invitationCode;
      this.isLoading = false;
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
}

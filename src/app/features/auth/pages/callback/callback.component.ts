import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticatedResult, LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div class="max-w-3xl w-full bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
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
            <button
              *ngIf="isAuthenticated"
              (click)="navigateHome()"
              class="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
            >
              Ir a la aplicación
            </button>
          </ng-container>
        </div>
      </div>
    </section>
  `
})
export class CallbackComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);

  idTokenPreview = 'No disponible';
  accessTokenPreview = 'No disponible';
  userData: unknown = null;
  error = '';
  isLoading = true;
  isAuthenticated = false;

  async ngOnInit(): Promise<void> {
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
        this.isAuthenticated = isAuthenticated;
        this.userData = userData;
      } else {
        const sessionState = await firstValueFrom<AuthenticatedResult>(this.oidcSecurityService.isAuthenticated$);
        this.isAuthenticated = sessionState.isAuthenticated;

        if (!this.isAuthenticated) {
          this.error = 'No se encontró un código de autorización para procesar.';
          return;
        }

        this.userData = await firstValueFrom(this.oidcSecurityService.userData$);
      }

      const [idToken, accessToken] = await Promise.all([
        firstValueFrom<string>(this.oidcSecurityService.getIdToken()),
        firstValueFrom<string>(this.oidcSecurityService.getAccessToken())
      ]);

      this.idTokenPreview = idToken || 'No disponible';
      this.accessTokenPreview = accessToken || 'No disponible';
      this.error = this.isAuthenticated ? '' : 'No se pudo establecer la sesión.';
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

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}

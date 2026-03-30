import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl"></div>
      </div>

      <div class="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16">
        <div class="w-full rounded-3xl border border-rose-400/20 bg-slate-900/70 p-10 shadow-2xl backdrop-blur">
          <p class="text-xs uppercase tracking-[0.4em] text-rose-200">Acceso denegado</p>
          <h1 class="mt-2 text-3xl font-semibold">No pudimos autorizar tu ingreso</h1>

          <div class="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
            <p class="text-base leading-7 text-slate-200">
              {{ description }}
            </p>

            <p *ngIf="technicalDetail" class="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {{ technicalDetail }}
            </p>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              routerLink="/login"
              class="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950"
            >
              Volver al login
            </a>

            <a
              routerLink="/"
              class="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-100"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AccessDeniedComponent {
  readonly reason: string | null;
  readonly detail: string | null;
  readonly description: string;
  readonly technicalDetail: string | null;

  constructor(private readonly route: ActivatedRoute) {
    this.reason = this.route.snapshot.queryParamMap.get('reason');
    this.detail = this.route.snapshot.queryParamMap.get('detail');
    this.description = this.resolveDescription(this.reason, this.detail);
    this.technicalDetail = this.resolveTechnicalDetail(this.reason, this.detail);
  }

  private resolveDescription(reason: string | null, detail: string | null): string {
    const normalizedDetail = (detail || '').toLowerCase();

    if (normalizedDetail.includes('presignup failed with error unauthorized')) {
      return 'Tu correo o tu empresa todavia no estan autorizados para ingresar en UniDev.';
    }

    if (normalizedDetail.includes('presignup failed with error internalerror')) {
      return 'No pudimos validar tu acceso con la configuracion actual de tu empresa. Intenta de nuevo en unos minutos o contacta al administrador.';
    }

    if (normalizedDetail.includes('invalid_request')) {
      return 'El proveedor de autenticacion rechazo la solicitud antes de completar el inicio de sesion.';
    }

    if (normalizedDetail.includes('access_denied')) {
      return 'El proveedor de autenticacion denego el acceso para esta cuenta.';
    }

    switch (reason) {
      case 'unauthorized':
        return 'Tu cuenta no cumple las reglas de acceso configuradas para UniDev.';
      case 'provider_error':
        return 'El proveedor de autenticacion no autorizo el acceso con esa cuenta.';
      default:
        return 'No fue posible completar tu autenticacion con los permisos actuales.';
    }
  }

  private resolveTechnicalDetail(reason: string | null, detail: string | null): string | null {
    if (!detail) {
      return null;
    }

    const normalizedDetail = detail.toLowerCase();
    const hiddenProviderErrors = [
      'presignup failed with error unauthorized',
      'presignup failed with error internalerror',
      'invalid_request',
      'access_denied'
    ];

    if (reason === 'provider_error' && hiddenProviderErrors.some(error => normalizedDetail.includes(error))) {
      return null;
    }

    if (reason === 'unauthorized' && normalizedDetail.includes('unauthorized')) {
      return null;
    }

    return detail;
  }
}

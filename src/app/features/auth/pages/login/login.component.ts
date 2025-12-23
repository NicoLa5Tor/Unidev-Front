import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService, FederatedProvider } from '../../../../core/services/auth.service';
import { MicrosoftAccessService } from '../../../../core/services/microsoft-access.service';
import { MicrosoftAccessResponseDto } from '../../../../core/models/microsoft-access.dto';
import { AnimatedTitleComponent } from '../../../../shared/components/animated-title/animated-title.component';
import { SocialLoginListComponent, SocialLoginProvider } from '../../../../shared/components/social-login-list/social-login-list.component';
import { MicrosoftGateDialogComponent } from '../../components/microsoft-gate-dialog/microsoft-gate-dialog.component';
import { MessageDialogComponent, MessageDialogData } from '../../../../shared/components/modal/message-dialog/message-dialog.component';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, AnimatedTitleComponent, SocialLoginListComponent, MatDialogModule, LoadingOverlayComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly microsoftAccessService = inject(MicrosoftAccessService);
  isRequestingMicrosoftAccess = false;
  private isRedirectingToMicrosoft = false;

  readonly socialProviders: SocialLoginProvider[] = [
    {
      key: 'google',
      name: 'Google',
      description: 'Inicia sesión en UniDev usando tu cuenta de Google',
      ctaIntro: 'Inicia sesión en UniDev usando',
      ctaDetail: 'tu cuenta de Google',
      avatarUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 16 16'><g fill='none' fill-rule='evenodd' clip-rule='evenodd'><path fill='%23f44336' d='M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86' opacity='.987'/><path fill='%23ffc107' d='M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92' opacity='.997'/><path fill='%23448aff' d='M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49' opacity='.999'/><path fill='%2343a047' d='M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z' opacity='.993'/></g></svg>"
    },
    {
      key: 'microsoft',
      name: 'Microsoft',
      description: 'Inicia sesión en UniDev usando tu cuenta institucional de Microsoft',
      ctaIntro: 'Inicia sesión en UniDev usando',
      ctaDetail: 'tu cuenta institucional de Microsoft',
      avatarUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 256 256'><path fill='%23F1511B' d='M121.666 121.666H0V0h121.666z'/><path fill='%2380CC28' d='M256 121.666H134.335V0H256z'/><path fill='%2300ADEF' d='M121.663 256.002H0V134.336h121.663z'/><path fill='%23FBBC09' d='M256 256.002H134.335V134.336H256z'/></svg>"
    }
  ];

  readonly isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;
  readonly userData$ = this.authService.userData$;

  onProviderConfirmed(provider: SocialLoginProvider): void {
    if (provider.key === 'microsoft') {
      if (this.shouldBypassMicrosoftDialog()) {
        this.authService.federatedSignIn('microsoft');
      } else {
        this.openMicrosoftDialog();
      }
      return;
    }

    this.authService.federatedSignIn(provider.key as FederatedProvider);
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  private shouldBypassMicrosoftDialog(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('microsoft-bypass') === 'true';
  }

  private openMicrosoftDialog(): void {
    this.dialog
      .open(MicrosoftGateDialogComponent, {
        width: '420px',
        maxWidth: '90vw',
        panelClass: 'microsoft-gate-dialog'
      })
      .afterClosed()
      .subscribe(result => {
        if (result?.action === 'register' && result.email) {
          this.requestMicrosoftAccess(result.email);
        }
      });
  }

  private requestMicrosoftAccess(email: string): void {
    console.debug('[MicrosoftAccess] Solicitando registro para', email);
    this.isRequestingMicrosoftAccess = true;
    this.microsoftAccessService
      .requestAccess(email)
      .pipe(
        finalize(() => {
          this.isRequestingMicrosoftAccess = false;
        })
      )
      .subscribe({
      next: response => {
        this.handleMicrosoftInviteResponse(response);
      },
      error: error => {
        console.error('Error registrando correo institucional', error);
        this.openMessageDialog({
          title: 'No pudimos procesar tu solicitud',
          message: 'Tuvimos un inconveniente al contactar con Microsoft. Intenta nuevamente en unos segundos.',
          type: 'error',
          confirmLabel: 'Reintentar más tarde'
        });
      }
      });
  }

  private handleMicrosoftInviteResponse(response: MicrosoftAccessResponseDto): void {
    const inviteUrl = response.inviteUrl?.trim();
    if (inviteUrl) {
      this.startMicrosoftRedirect(inviteUrl);
      return;
    }

    switch (response.status) {
      case 'INVITED':
        this.openMessageDialog({
          title: 'No encontramos el enlace',
          message: 'Recibimos tu solicitud pero Microsoft no devolvió el enlace de invitación. Intenta nuevamente.',
          type: 'error'
        });
        break;
      case 'EXISTS':
        this.persistMicrosoftBypass();
        this.authService.federatedSignIn('microsoft');
        break;
      case 'ERROR':
      default:
        this.openMessageDialog({
          title: 'No pudimos habilitar tu dominio',
          message: response.message || 'El dominio aún no está disponible para UniDev. Avísanos si crees que se trata de un error.',
          type: 'error'
        });
        break;
    }
  }

  private redirectToInvite(inviteUrl: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.href = inviteUrl;
  }

  private startMicrosoftRedirect(inviteUrl: string): void {
    this.isRedirectingToMicrosoft = true;
    this.redirectToInvite(inviteUrl);
  }

  private persistMicrosoftBypass(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('microsoft-bypass', 'true');
  }

  private openMessageDialog(data: MessageDialogData) {
    return this.dialog.open(MessageDialogComponent, {
      width: '440px',
      maxWidth: '92vw',
      panelClass: 'message-dialog-panel',
      data
    });
  }

  get overlayLabel(): string {
    return this.isRedirectingToMicrosoft ? 'Redirigiendo a Microsoft...' : 'Contactando Microsoft...';
  }

  get overlayHint(): string {
    return this.isRedirectingToMicrosoft
      ? 'Estamos abriendo el portal oficial, no cierres esta ventana.'
      : 'Estamos validando tu dominio institucional.';
  }

  get isOverlayVisible(): boolean {
    return this.isRequestingMicrosoftAccess || this.isRedirectingToMicrosoft;
  }
}

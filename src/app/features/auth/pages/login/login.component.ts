import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, FederatedProvider } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';

interface SocialProvider {
  key: FederatedProvider;
  name: string;
  description: string;
  accent: string;
  iconText: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  readonly socialProviders: SocialProvider[] = [
    {
      key: 'google',
      name: 'Google',
      description: 'Usa tu cuenta de Google para continuar',
      accent: 'from-rose-400 via-orange-400 to-amber-400',
      iconText: 'G'
    },
    {
      key: 'microsoft',
      name: 'Microsoft',
      description: 'Ingresa con tu cuenta del ecosistema Microsoft',
      accent: 'from-sky-500 via-blue-500 to-indigo-500',
      iconText: 'MS'
    }
  ];

  readonly isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;
  readonly userData$ = this.authService.userData$;

  onSocialSignIn(provider: SocialProvider): void {
    this.authService.federatedSignIn(provider.key);
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}

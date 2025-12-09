import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService, FederatedProvider } from '../../../../core/services/auth.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
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
    },
    {
      key: 'apple',
      name: 'Apple',
      description: 'Accede con tu Apple ID',
      accent: 'from-slate-900 via-gray-800 to-gray-600',
      iconText: 'AP'
    }
  ];

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false]
  });

  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .login(email, password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          // The interceptor and guards react to the updated auth state
        },
        error: error => {
          this.errorMessage = this.mapAuthError(error);
        }
      });
  }

  onSocialSignIn(provider: SocialProvider): void {
    this.errorMessage = '';
    try {
      this.authService.federatedSignIn(provider.key);
    } catch (error) {
      this.errorMessage = this.mapAuthError(error);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private mapAuthError(error: unknown): string {
    if (!error) {
      return 'Ocurrió un error inesperado. Intenta nuevamente.';
    }

    const message = (error as { message?: string }).message ?? '';

    if (message.includes('UserNotFoundException')) {
      return 'No encontramos una cuenta con ese correo.';
    }

    if (message.includes('NotAuthorizedException')) {
      return 'Las credenciales no son correctas. Verifícalas e intenta de nuevo.';
    }

    return message || 'No pudimos iniciar sesión. Por favor, inténtalo más tarde.';
  }
}

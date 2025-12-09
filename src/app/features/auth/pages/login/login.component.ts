import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SocialProvider {
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
  readonly socialProviders: SocialProvider[] = [
    {
      name: 'Google',
      description: 'Usa tu cuenta de Google para continuar',
      accent: 'from-rose-400 via-orange-400 to-amber-400',
      iconText: 'G'
    },
    {
      name: 'Microsoft',
      description: 'Ingresa con tu cuenta del ecosistema Microsoft',
      accent: 'from-sky-500 via-blue-500 to-indigo-500',
      iconText: 'MS'
    },
    {
      name: 'Apple',
      description: 'Accede con tu Apple ID',
      accent: 'from-slate-900 via-gray-800 to-gray-600',
      iconText: 'AP'
    }
  ];
}

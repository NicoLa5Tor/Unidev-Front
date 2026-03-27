import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-companies-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './companies-home.component.html'
})
export class CompaniesHomeComponent {
  isSubmitting = false;
  message: { type: 'success' | 'error'; text: string } | null = null;

  readonly steps = [
    {
      title: 'Solicita el alta de tu empresa',
      description: 'Registra la empresa y el correo principal que va a administrarla.'
    },
    {
      title: 'Espera aprobacion administrativa',
      description: 'UniDev revisa la empresa antes de habilitar operacion interna.'
    },
    {
      title: 'Gestiona accesos internos',
      description: 'Cuando la empresa quede aprobada, podras cargar lista blanca de correos y operar el panel.'
    }
  ];

  readonly highlights = [
    'Registro empresarial con aprobacion manual',
    'Habilitacion posterior de accesos por empresa',
    'Control posterior de accesos por lista blanca'
  ];

  readonly form = {
    companyName: '',
    nit: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    domain: '',
    description: '',
    address: ''
  };

  constructor(private readonly companyService: CompanyService) {}

  submit(): void {
    if (!this.form.companyName.trim() || !this.form.domain.trim() || !this.form.contactEmail.trim()) {
      this.message = { type: 'error', text: 'Nombre de empresa, dominio y correo de contacto son obligatorios.' };
      return;
    }

    this.isSubmitting = true;
    this.message = null;

    this.companyService.createCompany({
      ownerId: null,
      planId: null,
      companyName: this.form.companyName.trim(),
      nit: this.toNullable(this.form.nit),
      contactName: this.toNullable(this.form.contactName),
      contactEmail: this.form.contactEmail.trim(),
      contactPhone: this.toNullable(this.form.contactPhone),
      website: this.toNullable(this.form.website),
      domain: this.normalizeDomain(this.form.domain),
      description: this.toNullable(this.form.description),
      address: this.toNullable(this.form.address),
      onboardingCompleted: false,
      approvalStatus: 'PENDING',
      subscriptionStatus: 'NOT_REQUESTED'
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.message = {
          type: 'success',
          text: 'Solicitud enviada. Un administrador debe aprobar la empresa antes de habilitarla.'
        };
        this.resetForm();
      },
      error: () => {
        this.isSubmitting = false;
        this.message = {
          type: 'error',
          text: 'No pudimos registrar la solicitud. Revisa los datos e intenta de nuevo.'
        };
      }
    });
  }

  private normalizeDomain(value: string): string {
    return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  private toNullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private resetForm(): void {
    this.form.companyName = '';
    this.form.nit = '';
    this.form.contactName = '';
    this.form.contactEmail = '';
    this.form.contactPhone = '';
    this.form.website = '';
    this.form.domain = '';
    this.form.description = '';
    this.form.address = '';
  }
}

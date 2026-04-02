import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CompanyService } from '../../services/company.service';
import { CompanyRegistrationDocument } from '../../../../shared/models/company.model';

@Component({
  selector: 'app-companies-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './companies-home.component.html'
})
export class CompaniesHomeComponent {
  isSubmitting = false;
  isRequestingOtp = false;
  isVerifyingOtp = false;
  registrationStep: 'email' | 'otp' | 'company' = 'email';
  isUploadingLegal = false;
  isUploadingTax = false;
  verifiedEmail: string | null = null;
  uploadedDocuments: CompanyRegistrationDocument[] = [];
  message: { type: 'success' | 'error'; text: string } | null = null;
  readonly microsoftLogo =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 256 256'><path fill='%23F1511B' d='M121.666 121.666H0V0h121.666z'/><path fill='%2380CC28' d='M256 121.666H134.335V0H256z'/><path fill='%2300ADEF' d='M121.663 256.002H0V134.336h121.663z'/><path fill='%23FBBC09' d='M256 256.002H134.335V134.336H256z'/></svg>";
  readonly googleLogo =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 16 16'><g fill='none' fill-rule='evenodd' clip-rule='evenodd'><path fill='%23f44336' d='M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86' opacity='.987'/><path fill='%23ffc107' d='M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92' opacity='.997'/><path fill='%23448aff' d='M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49' opacity='.999'/><path fill='%2343a047' d='M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z' opacity='.993'/></g></svg>";

  readonly steps = [
    {
      title: 'Solicita el alta de tu empresa',
      description: 'Registra la empresa y el correo del administrador que luego recibira la decision.'
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
    'Validacion posterior del administrador real por proveedor',
    'Control posterior de accesos por lista blanca'
  ];

  readonly form = {
    email: '',
    confirmEmail: '',
    otpCode: '',
    companyName: '',
    nit: '',
    contactName: '',
    contactEmail: '',
    confirmContactEmail: '',
    authProvider: 'MICROSOFT',
    contactPhone: '',
    website: '',
    domain: '',
    description: '',
    address: ''
  };

  constructor(
    private readonly companyService: CompanyService,
    private readonly router: Router
  ) {}

  setAuthProvider(provider: 'MICROSOFT' | 'GOOGLE'): void {
    this.form.authProvider = provider;
  }

  requestOtp(): void {
    if (!this.form.email.trim()) {
      this.message = { type: 'error', text: 'El correo del administrador es obligatorio.' };
      return;
    }
    if (this.form.email.trim().toLowerCase() !== this.form.confirmEmail.trim().toLowerCase()) {
      this.message = { type: 'error', text: 'Los correos del administrador no coinciden.' };
      return;
    }

    this.isRequestingOtp = true;
    this.message = null;

    this.companyService.requestCompanyOtp({ email: this.form.email.trim() }).subscribe({
      next: (response) => {
        this.isRequestingOtp = false;
        this.applyOtpFlow(response.action, response.message || 'Operacion completada.');
      },
      error: () => {
        this.isRequestingOtp = false;
        this.message = {
          type: 'error',
          text: 'No pudimos enviar el codigo OTP. Intenta de nuevo.'
        };
      }
    });
  }

  verifyOtp(): void {
    if (!/^\d{6}$/.test(this.form.otpCode.trim())) {
      this.message = { type: 'error', text: 'Ingresa un codigo OTP valido de 6 digitos.' };
      return;
    }

    this.isVerifyingOtp = true;
    this.message = null;

    this.companyService.verifyCompanyOtp({
      email: this.form.email.trim(),
      code: this.form.otpCode.trim()
    }).subscribe({
      next: (response) => {
        this.isVerifyingOtp = false;
        this.registrationStep = 'company';
        this.verifiedEmail = this.form.email.trim().toLowerCase();
        this.form.contactEmail = this.verifiedEmail;
        this.form.confirmContactEmail = this.verifiedEmail;
        this.message = {
          type: 'success',
          text: response.message || 'Correo verificado correctamente.'
        };
      },
      error: () => {
        this.isVerifyingOtp = false;
        this.message = {
          type: 'error',
          text: 'El codigo OTP no es valido o ya expiro.'
        };
      }
    });
  }

  backToEmail(): void {
    this.registrationStep = 'email';
    this.form.otpCode = '';
    this.message = null;
  }

  submit(): void {
    if (this.registrationStep !== 'company' || !this.verifiedEmail) {
      this.message = { type: 'error', text: 'Primero debes verificar el correo del administrador.' };
      return;
    }
    if (!this.form.companyName.trim() || !this.form.domain.trim() || !this.form.contactEmail.trim()) {
      this.message = { type: 'error', text: 'Nombre de empresa, dominio y correo del administrador son obligatorios.' };
      return;
    }
    if (this.form.contactEmail.trim().toLowerCase() !== this.verifiedEmail.toLowerCase()) {
      this.message = { type: 'error', text: 'El correo verificado no coincide con el correo del administrador.' };
      return;
    }
    if (!this.hasDocument('LEGAL_CERTIFICATE') || !this.hasDocument('TAX_DOCUMENT')) {
      this.message = { type: 'error', text: 'Debes subir el certificado legal y el documento tributario antes de enviar.' };
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
      authProvider: this.form.authProvider,
      contactPhone: this.toNullable(this.form.contactPhone),
      website: this.toNullable(this.form.website),
      domain: this.normalizeDomain(this.form.domain),
      description: this.toNullable(this.form.description),
      address: this.toNullable(this.form.address),
      onboardingCompleted: false,
      approvalStatus: 'PENDING',
      subscriptionStatus: 'NOT_REQUESTED',
      ownerVerificationStatus: 'EMAIL_VERIFIED',
      verifiedOwnerEmail: this.verifiedEmail
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
    this.registrationStep = 'email';
    this.verifiedEmail = null;
    this.uploadedDocuments = [];
    this.form.email = '';
    this.form.confirmEmail = '';
    this.form.otpCode = '';
    this.form.companyName = '';
    this.form.nit = '';
    this.form.contactName = '';
    this.form.contactEmail = '';
    this.form.confirmContactEmail = '';
    this.form.authProvider = 'MICROSOFT';
    this.form.contactPhone = '';
    this.form.website = '';
    this.form.domain = '';
    this.form.description = '';
    this.form.address = '';
  }

  private applyOtpFlow(action: string, message: string): void {
    switch (action) {
      case 'CONTINUE_COMPANY':
        this.registrationStep = 'company';
        this.verifiedEmail = this.form.email.trim().toLowerCase();
        this.form.contactEmail = this.verifiedEmail;
        this.form.confirmContactEmail = this.verifiedEmail;
        this.loadDocumentsForVerifiedEmail();
        this.message = { type: 'success', text: message };
        break;
      case 'VERIFY_OTP':
      case 'OTP_SENT':
        this.registrationStep = 'otp';
        this.message = { type: 'success', text: message };
        break;
      case 'GO_TO_LOGIN':
        this.message = { type: 'success', text: message };
        this.router.navigate(['/login']);
        break;
      case 'PENDING_REVIEW':
        this.message = { type: 'error', text: message };
        break;
      default:
        this.registrationStep = 'otp';
        this.message = { type: 'success', text: message };
        break;
    }
  }

  uploadDocument(event: Event, documentType: 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT'): void {
    if (!this.verifiedEmail) {
      this.message = { type: 'error', text: 'Primero debes verificar el correo del administrador.' };
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (documentType === 'LEGAL_CERTIFICATE') {
      this.isUploadingLegal = true;
    } else {
      this.isUploadingTax = true;
    }
    this.message = null;

    this.companyService.uploadRegistrationDocument(this.verifiedEmail, documentType, file).subscribe({
      next: document => {
        this.upsertDocument(document);
        if (documentType === 'LEGAL_CERTIFICATE') {
          this.isUploadingLegal = false;
        } else {
          this.isUploadingTax = false;
        }
        input.value = '';
        this.message = { type: 'success', text: 'Documento cargado correctamente.' };
      },
      error: (error) => {
        if (documentType === 'LEGAL_CERTIFICATE') {
          this.isUploadingLegal = false;
        } else {
          this.isUploadingTax = false;
        }
        input.value = '';
        this.message = {
          type: 'error',
          text: error?.error?.message || 'No pudimos cargar el documento.'
        };
      }
    });
  }

  getDocument(documentType: 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT'): CompanyRegistrationDocument | undefined {
    return this.uploadedDocuments.find(document => document.documentType === documentType);
  }

  downloadDocument(document: CompanyRegistrationDocument): void {
    window.open(this.companyService.downloadRegistrationDocument(document.id), '_blank', 'noopener');
  }

  private hasDocument(documentType: 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT'): boolean {
    return !!this.getDocument(documentType);
  }

  private upsertDocument(document: CompanyRegistrationDocument): void {
    this.uploadedDocuments = [
      ...this.uploadedDocuments.filter(item => item.documentType !== document.documentType),
      document
    ];
  }

  private loadDocumentsForVerifiedEmail(): void {
    if (!this.verifiedEmail) {
      return;
    }
    this.companyService.listRegistrationDocuments(this.verifiedEmail).subscribe({
      next: documents => {
        this.uploadedDocuments = documents;
      },
      error: () => {
        this.uploadedDocuments = [];
      }
    });
  }
}

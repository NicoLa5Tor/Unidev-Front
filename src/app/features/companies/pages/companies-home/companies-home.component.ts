import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
export class CompaniesHomeComponent implements OnDestroy {
  isSubmitting = false;
  isRequestingOtp = false;
  isVerifyingOtp = false;
  registrationStep: 'email' | 'otp' | 'company' = 'email';
  isUploadingLegal = false;
  isUploadingTax = false;
  verifiedEmail: string | null = null;
  uploadedDocuments: CompanyRegistrationDocument[] = [];
  private readonly localDocumentUrls: Partial<Record<CompanyRegistrationDocument['documentType'], string>> = {};
  message: { type: 'success' | 'error'; text: string } | null = null;
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

  ngOnDestroy(): void {
    this.revokeAllLocalDocumentUrls();
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
    this.revokeAllLocalDocumentUrls();
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
        this.setLocalDocumentUrl(documentType, file);
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
    const localUrl = this.localDocumentUrls[document.documentType];
    if (localUrl) {
      window.open(localUrl, '_blank', 'noopener');
      return;
    }

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
    this.revokeAllLocalDocumentUrls();
    this.companyService.listRegistrationDocuments(this.verifiedEmail).subscribe({
      next: documents => {
        this.uploadedDocuments = documents;
      },
      error: () => {
        this.uploadedDocuments = [];
      }
    });
  }

  private setLocalDocumentUrl(
    documentType: CompanyRegistrationDocument['documentType'],
    file: File
  ): void {
    const currentUrl = this.localDocumentUrls[documentType];
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    this.localDocumentUrls[documentType] = URL.createObjectURL(file);
  }

  private revokeAllLocalDocumentUrls(): void {
    Object.values(this.localDocumentUrls).forEach(url => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

    this.localDocumentUrls.LEGAL_CERTIFICATE = undefined;
    this.localDocumentUrls.TAX_DOCUMENT = undefined;
  }
}

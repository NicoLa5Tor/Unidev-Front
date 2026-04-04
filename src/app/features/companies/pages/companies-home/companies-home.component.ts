import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, Observable, of, switchMap, tap } from 'rxjs';

import { CompanyService } from '../../services/company.service';
import { CompanyRegistrationDocument } from '../../../../shared/models/company.model';
import { ScriptLoaderService } from '../../../../shared/services/script-loader.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

type RegistrationDocumentType = CompanyRegistrationDocument['documentType'];
type CompanyFormField = 'companyName' | 'domain' | 'nit' | 'contactEmail';
type DocumentHelpType = 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT';

@Component({
  selector: 'app-companies-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './companies-home.component.html',
  styleUrl: './companies-home.component.scss'
})
export class CompaniesHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('flowTrack') private flowTrack?: ElementRef<HTMLDivElement>;
  @ViewChildren('flowStepCard') private flowStepCards?: QueryList<ElementRef<HTMLElement>>;

  isSubmitting = false;
  isRequestingOtp = false;
  isVerifyingOtp = false;
  registrationStep: 'email' | 'otp' | 'company' = 'email';
  isUploadingLegal = false;
  isUploadingTax = false;
  verifiedEmail: string | null = null;
  uploadedDocuments: CompanyRegistrationDocument[] = [];
  activeDocumentHelp: {
    type: DocumentHelpType;
    title: string;
    summary: string;
    bullets: string[];
  } | null = null;
  companyFieldErrors: Partial<Record<CompanyFormField, string>> = {};
  companyDocumentsError: string | null = null;
  private readonly localDocumentUrls: Partial<Record<CompanyRegistrationDocument['documentType'], string>> = {};
  private readonly pendingDocumentFiles: Partial<Record<RegistrationDocumentType, File>> = {};
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

  private gsapInstance?: any;
  private flowCleanup?: () => void;

  constructor(
    private readonly companyService: CompanyService,
    private readonly router: Router,
    private readonly scriptLoader: ScriptLoaderService,
    private readonly ngZone: NgZone,
    private readonly toast: UiToastService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await this.scriptLoader.load('gsap', 'https://unpkg.com/gsap@3/dist/gsap.min.js');
      this.gsapInstance = (window as any).gsap;
      this.ngZone.runOutsideAngular(() => this.initFlowMotion());
    } catch {
      this.gsapInstance = undefined;
    }
  }

  ngOnDestroy(): void {
    this.revokeAllLocalDocumentUrls();
    this.flowCleanup?.();
    this.flowCleanup = undefined;
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
        this.toast.success(response.message || 'Operacion completada.');
      },
      error: () => {
        this.isRequestingOtp = false;
        const errorMessage = 'No pudimos enviar el codigo OTP. Intenta de nuevo.';
        this.message = { type: 'error', text: errorMessage };
        this.toast.error(errorMessage);
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
        this.toast.success(response.message || 'Correo verificado correctamente.');
      },
      error: () => {
        this.isVerifyingOtp = false;
        const errorMessage = 'El codigo OTP no es valido o ya expiro.';
        this.message = { type: 'error', text: errorMessage };
        this.toast.error(errorMessage);
      }
    });
  }

  backToEmail(): void {
    this.registrationStep = 'email';
    this.form.otpCode = '';
    this.clearCompanyFormErrors();
    this.message = null;
  }

  submit(): void {
    if (this.registrationStep !== 'company' || !this.verifiedEmail) {
      this.message = { type: 'error', text: 'Primero debes verificar el correo del administrador.' };
      return;
    }

    this.clearCompanyFormErrors();
    if (!this.validateCompanyForm()) {
      this.message = { type: 'error', text: 'Revisa los campos marcados en el formulario.' };
      return;
    }

    this.isSubmitting = true;
    this.message = null;
    const companyName = this.form.companyName.trim();

    this.uploadPendingDocuments(companyName).pipe(
      switchMap(() => this.companyService.createCompany({
        ownerId: null,
        planId: null,
        companyName,
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
      }))
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        const successMessage = 'Solicitud enviada. Un administrador debe aprobar la empresa antes de habilitarla.';
        this.message = { type: 'success', text: successMessage };
        this.toast.success(successMessage);
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        const hasFieldErrors = this.applyCompanyFieldErrorsFromResponse(error);
        const errorMessage = hasFieldErrors
          ? 'Revisa los campos marcados en el formulario.'
          : error?.error?.message || 'No pudimos registrar la solicitud. Revisa los datos e intenta de nuevo.';
        this.message = { type: 'error', text: errorMessage };
        this.toast.error(errorMessage);
      }
    });
  }

  clearCompanyFieldError(field: CompanyFormField): void {
    if (!this.companyFieldErrors[field]) {
      return;
    }

    this.companyFieldErrors = {
      ...this.companyFieldErrors,
      [field]: undefined
    };
  }

  clearCompanyDocumentsError(): void {
    this.companyDocumentsError = null;
  }

  hasCompanyFieldError(field: CompanyFormField): boolean {
    return !!this.companyFieldErrors[field];
  }

  getCompanyFieldError(field: CompanyFormField): string | null {
    return this.companyFieldErrors[field] ?? null;
  }

  openDocumentHelp(type: DocumentHelpType): void {
    if (type === 'LEGAL_CERTIFICATE') {
      this.activeDocumentHelp = {
        type,
        title: 'Certificado legal',
        summary: 'Documento que demuestra la existencia formal de la empresa o su equivalente oficial.',
        bullets: [
          'Camara de Comercio, certificado de existencia o documento oficial equivalente.',
          'Debe verse claro el nombre de la empresa.',
          'Acepta PDF, PNG o JPG.'
        ]
      };
      return;
    }

    this.activeDocumentHelp = {
      type,
      title: 'Documento tributario',
      summary: 'Documento fiscal donde se vea la razon social y el NIT registrado.',
      bullets: [
        'RUT o documento tributario oficial equivalente.',
        'Debe coincidir con el NIT que escribes en el formulario.',
        'Acepta PDF, PNG o JPG.'
      ]
    };
  }

  closeDocumentHelp(): void {
    this.activeDocumentHelp = null;
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
    this.clearCompanyFormErrors();
    this.pendingDocumentFiles.LEGAL_CERTIFICATE = undefined;
    this.pendingDocumentFiles.TAX_DOCUMENT = undefined;
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

  private validateCompanyForm(): boolean {
    const fieldErrors: Partial<Record<CompanyFormField, string>> = {};
    const companyName = this.form.companyName.trim();
    const domain = this.normalizeDomain(this.form.domain);
    const nit = this.form.nit.trim();
    const contactEmail = this.form.contactEmail.trim().toLowerCase();

    if (!companyName) {
      fieldErrors.companyName = 'Escribe el nombre de la empresa.';
    }

    if (!domain) {
      fieldErrors.domain = 'Escribe el dominio empresarial.';
    }

    if (!nit) {
      fieldErrors.nit = 'Escribe el NIT de la empresa.';
    }

    if (!contactEmail) {
      fieldErrors.contactEmail = 'Falta el correo del administrador.';
    } else if (!this.isValidEmail(contactEmail)) {
      fieldErrors.contactEmail = 'Escribe un correo valido.';
    } else if (this.verifiedEmail && contactEmail !== this.verifiedEmail.toLowerCase()) {
      fieldErrors.contactEmail = 'El correo verificado no coincide con el correo del administrador.';
    }

    this.companyFieldErrors = fieldErrors;

    if (!this.hasDocument('LEGAL_CERTIFICATE') || !this.hasDocument('TAX_DOCUMENT')) {
      this.companyDocumentsError = 'Debes subir el certificado legal y el documento tributario antes de enviar.';
    }

    return Object.keys(fieldErrors).length === 0 && !this.companyDocumentsError;
  }

  private clearCompanyFormErrors(): void {
    this.companyFieldErrors = {};
    this.companyDocumentsError = null;
  }

  private applyCompanyFieldErrorsFromResponse(error: any): boolean {
    const fieldErrors = error?.error?.fieldErrors;
    if (!fieldErrors || typeof fieldErrors !== 'object') {
      return false;
    }

    const nextErrors: Partial<Record<CompanyFormField, string>> = {};

    (['companyName', 'domain', 'nit', 'contactEmail'] as CompanyFormField[]).forEach((field) => {
      const message = fieldErrors[field];
      if (typeof message === 'string' && message.trim()) {
        nextErrors[field] = message;
      }
    });

    this.companyFieldErrors = nextErrors;
    return Object.keys(nextErrors).length > 0;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private applyOtpFlow(action: string, message: string): void {
    switch (action) {
      case 'CONTINUE_COMPANY':
        this.registrationStep = 'company';
        this.verifiedEmail = this.form.email.trim().toLowerCase();
        this.form.contactEmail = this.verifiedEmail;
        this.form.confirmContactEmail = this.verifiedEmail;
        this.clearCompanyFormErrors();
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
    if (!this.form.companyName.trim()) {
      this.companyFieldErrors = {
        ...this.companyFieldErrors,
        companyName: 'Escribe primero el nombre de la empresa.'
      };
      this.message = { type: 'error', text: 'Revisa los campos marcados en el formulario.' };
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.pendingDocumentFiles[documentType] = file;
    this.clearCompanyDocumentsError();
    this.setLocalDocumentUrl(documentType, file);
    this.upsertDocument({
      id: this.getDocument(documentType)?.id ?? 0,
      documentType,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      fileSize: file.size,
      status: 'PENDING_UPLOAD'
    });
    input.value = '';
    this.toast.success('Documento listo para enviarse con la solicitud.');
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

  private uploadPendingDocuments(companyName: string): Observable<CompanyRegistrationDocument[]> {
    const uploads = (['LEGAL_CERTIFICATE', 'TAX_DOCUMENT'] as const)
      .map((documentType) => {
        const file = this.pendingDocumentFiles[documentType];
        if (!file || !this.verifiedEmail) {
          return null;
        }

        return this.companyService.uploadRegistrationDocument(
          this.verifiedEmail,
          companyName,
          documentType,
          file
        ).pipe(
          tap(document => {
            this.upsertDocument(document);
            this.pendingDocumentFiles[documentType] = undefined;
          })
        );
      })
      .filter((upload): upload is Observable<CompanyRegistrationDocument> => upload !== null);

    if (!uploads.length) {
      return of([]);
    }

    this.isUploadingLegal = !!this.pendingDocumentFiles.LEGAL_CERTIFICATE;
    this.isUploadingTax = !!this.pendingDocumentFiles.TAX_DOCUMENT;

    return forkJoin(uploads).pipe(
      tap({
        next: () => {
          this.isUploadingLegal = false;
          this.isUploadingTax = false;
        },
        error: () => {
          this.isUploadingLegal = false;
          this.isUploadingTax = false;
        }
      })
    );
  }

  private initFlowMotion(): void {
    const gsap = this.gsapInstance;
    const track = this.flowTrack?.nativeElement;
    const cards = this.flowStepCards?.toArray().map(card => card.nativeElement) ?? [];

    if (!gsap || !track || cards.length === 0) {
      return;
    }

    gsap.from(cards, {
      opacity: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out'
    });

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile) {
      return;
    }

    const updateCards = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(center - cardCenter);
        const ratio = Math.min(distance / (trackRect.width * 0.55), 1);
        const scale = 1 - ratio * 0.08;
        const opacity = 1 - ratio * 0.28;

        gsap.to(card, {
          scale,
          opacity,
          y: ratio * 10,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: true
        });
      });
    };

    const handleScroll = () => updateCards();
    track.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updateCards();

    this.flowCleanup = () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }
}

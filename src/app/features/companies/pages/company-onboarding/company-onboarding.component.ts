import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserSessionService } from '../../../../core/services/user-session.service';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { CompanyService } from '../../services/company.service';
import { CompanyAccessService } from '../../services/company-access.service';
import { Company, CompanyRegistrationDocument, CompanyReviewItem, CreateCompanyDto, UpdateCompanyProfileDto, UpdateRejectedCompanyDraftDto } from '../../../../shared/models/company.model';
import { SessionUser } from '../../../../shared/models/session-user.model';
import { CompanyAllowedEmail } from '../../../../shared/models/company-access.model';
import { CompanyFormModel } from './company-onboarding.types';

type CompanyTab = 'status' | 'profile' | 'access';
type MessageState = { type: 'success' | 'error'; text: string } | null;
type CreateField = 'companyName' | 'domain' | 'nit' | 'contactEmail';
type RegistrationDocumentType = 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT';

@Component({
  selector: 'app-company-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardShellComponent
  ],
  templateUrl: './company-onboarding.component.html'
})
export class CompanyOnboardingComponent implements OnInit {
  activeTab: CompanyTab = 'status';
  isLoading = false;
  isSaving = false;
  isUpdatingProfile = false;
  isUploadingLogo = false;
  isAccessLoading = false;
  isAddingAllowedEmail = false;
  isDocumentsLoading = false;
  isReviewItemsLoading = false;
  isResubmissionModalOpen = false;
  isSavingRejectedDraft = false;
  message: MessageState = null;
  createFieldErrors: Partial<Record<CreateField, string>> = {};
  sessionUser: SessionUser | null = null;
  currentCompany: Company | null = null;
  allowedEmails: CompanyAllowedEmail[] = [];
  registrationDocuments: CompanyRegistrationDocument[] = [];
  reviewItems: CompanyReviewItem[] = [];
  allowedEmailInput = '';
  uploadingDocumentType: RegistrationDocumentType | null = null;
  private hasLoadedAccessData = false;

  readonly ownerNavItems: DashboardNavItem[] = [
    { id: 'status', label: 'Estado', accent: 'accent-3', mobileBarWidthClass: 'w-20' },
    { id: 'profile', label: 'Perfil', accent: 'accent-1', mobileBarWidthClass: 'w-20' },
    { id: 'access', label: 'Correos', accent: 'accent-2', mobileBarWidthClass: 'w-20' }
  ];

  readonly memberNavItems: DashboardNavItem[] = [
    { id: 'status', label: 'Estado', accent: 'accent-3', mobileBarWidthClass: 'w-20' },
    { id: 'profile', label: 'Perfil', accent: 'accent-1', mobileBarWidthClass: 'w-20' }
  ];

  readonly form: CompanyFormModel = {
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

  constructor(
    private readonly companyService: CompanyService,
    private readonly companyAccessService: CompanyAccessService,
    private readonly userSessionService: UserSessionService,
    private readonly uiToastService: UiToastService
  ) {}

  ngOnInit(): void {
    this.loadViewData();
  }

  get isCompanyMemberView(): boolean {
    return this.sessionUser?.roleName === 'USUARIOS_EMPRESA';
  }

  get isCompanyOwnerView(): boolean {
    return this.sessionUser?.roleName === 'EMPRESAS';
  }

  get canManageCompanyAccess(): boolean {
    return this.isCompanyOwnerView;
  }

  get canManageCompanyAssets(): boolean {
    return this.isCompanyOwnerView;
  }

  get navItems(): DashboardNavItem[] {
    return this.isCompanyMemberView ? this.memberNavItems : this.ownerNavItems;
  }

  get isApprovedCompany(): boolean {
    return this.currentCompany?.approvalStatus === 'APPROVED';
  }

  get canSubmit(): boolean {
    return !!this.sessionUser && !this.currentCompany;
  }

  get hasEditableProfileFields(): boolean {
    return !!this.currentCompany;
  }

  get companyDomain(): string {
    return this.normalizeDomain(this.currentCompany?.domain ?? this.form.domain ?? '');
  }

  get activeAllowedEmailsCount(): number {
    return this.allowedEmails.filter(item => item.status === 'ACTIVE').length;
  }

  get profileCompletionCount(): number {
    const values = [
      this.currentCompany?.contactName,
      this.currentCompany?.contactPhone,
      this.currentCompany?.website,
      this.currentCompany?.address,
      this.currentCompany?.description
    ];

    return values.filter(value => !!value?.trim()).length;
  }

  get profileCompletionPercent(): number {
    return Math.round((this.profileCompletionCount / 5) * 100);
  }

  get companyStatusLabel(): string {
    switch (this.currentCompany?.approvalStatus) {
      case 'APPROVED':
        return 'Aprobada';
      case 'REJECTED':
        return 'Rechazada';
      case 'CHANGES_REQUESTED':
        return 'Correcciones solicitadas';
      case 'PENDING':
        return 'Pendiente';
      default:
        return this.currentCompany ? 'En revision' : 'Sin registrar';
    }
  }

  get companyStatusClass(): string {
    switch (this.currentCompany?.approvalStatus) {
      case 'APPROVED':
        return 'border-emerald-400/35 bg-emerald-400/12 text-emerald-100';
      case 'REJECTED':
        return 'border-rose-400/35 bg-rose-400/12 text-rose-100';
      case 'CHANGES_REQUESTED':
        return 'border-rose-400/35 bg-rose-400/12 text-rose-100';
      case 'PENDING':
        return 'border-amber-400/35 bg-amber-400/12 text-amber-100';
      default:
        return 'border-[color:var(--panel-border)] bg-[var(--panel-2)] text-[var(--muted)]';
    }
  }

  get ownerVerificationLabel(): string {
    switch (this.currentCompany?.ownerVerificationStatus) {
      case 'VERIFIED':
      case 'EMAIL_VERIFIED':
        return 'Correo verificado';
      default:
        return this.currentCompany ? 'Pendiente' : 'Sin validar';
    }
  }

  get ownerVerificationClass(): string {
    switch (this.currentCompany?.ownerVerificationStatus) {
      case 'VERIFIED':
      case 'EMAIL_VERIFIED':
        return 'text-emerald-200';
      default:
        return 'text-amber-200';
    }
  }

  get nextActionTitle(): string {
    if (!this.currentCompany) {
      return 'Completa el registro inicial';
    }
    if (this.currentCompany.approvalStatus === 'CHANGES_REQUESTED') {
      return 'Hay correcciones obligatorias por resolver';
    }
    if (this.currentCompany.approvalStatus === 'REJECTED') {
      return this.canResubmitRejectedCompany
        ? 'La solicitud puede volver a enviarse'
        : 'Solicitud rechazada con espera activa';
    }
    if (this.currentCompany.approvalStatus !== 'APPROVED') {
      return 'Esperando decision administrativa';
    }
    if (this.activeAllowedEmailsCount === 0) {
      return 'Habilita los primeros correos corporativos';
    }
    if (this.profileCompletionCount < 5) {
      return 'Completa los datos operativos pendientes';
    }
    return 'Empresa lista para operar';
  }

  get nextActionDescription(): string {
    if (!this.currentCompany) {
      return 'Registra nombre, dominio, NIT y correo principal para dejar la empresa lista para revision.';
    }
    if (this.currentCompany.approvalStatus === 'CHANGES_REQUESTED') {
      return 'Revisa los campos obligatorios y documentos observados por el admin, corrige solo esos items y vuelve a enviarlos.';
    }
    if (this.currentCompany.approvalStatus === 'REJECTED') {
      return this.canResubmitRejectedCompany
        ? 'Ya puedes reenviar la solicitud para que el equipo administrador vuelva a revisar la empresa.'
        : `Debes esperar ${this.resubmissionCountdownLabel} antes de poder reenviar la solicitud.`;
    }
    if (this.currentCompany.approvalStatus !== 'APPROVED') {
      return 'Mientras se revisa la solicitud no se habilitan accesos corporativos ni administracion de correos.';
    }
    if (this.activeAllowedEmailsCount === 0) {
      return `Empieza agregando correos del dominio ${this.companyDomain} para habilitar ingreso a tu equipo.`;
    }
    if (this.profileCompletionCount < 5) {
      return 'Nombre de contacto, telefono, sitio web, direccion y descripcion ayudan a completar el perfil operativo de la empresa.';
    }
    return 'El perfil ya tiene los datos base y la lista blanca inicial para que el equipo pueda entrar con su correo empresarial.';
  }

  get heroTitle(): string {
    return this.currentCompany?.companyName ?? 'Activa tu espacio empresarial';
  }

  get dashboardTitle(): string {
    return this.currentCompany?.companyName ?? 'Empresa';
  }

  get dashboardAvatarImageUrl(): string | null {
    return this.currentCompany?.logoUrl ?? null;
  }

  get dashboardAvatarLabel(): string {
    const source = this.currentCompany?.companyName ?? 'Empresa';
    const parts = source.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) {
      return 'EM';
    }
    return parts.map(part => part[0]?.toUpperCase() ?? '').join('');
  }

  get heroDescription(): string {
    if (!this.currentCompany) {
      return 'Registra la empresa, define el dominio oficial y deja listo el acceso para que un administrador valide la operacion.';
    }
    if (this.isCompanyMemberView) {
      return 'Consulta la informacion compartida de la empresa y mantén al dia los datos operativos que usa el equipo.';
    }
    return 'Gestiona el perfil de la empresa y mantén bajo control los correos corporativos que pueden entrar a la plataforma.';
  }

  get isRejectedCompany(): boolean {
    return this.currentCompany?.approvalStatus === 'REJECTED';
  }

  get isChangesRequestedCompany(): boolean {
    return this.currentCompany?.approvalStatus === 'CHANGES_REQUESTED';
  }

  get rejectionCooldownRemainingMs(): number {
    if (!this.currentCompany || !this.isRejectedCompany) {
      return 0;
    }
    const updatedAt = this.currentCompany.updatedAt ? new Date(this.currentCompany.updatedAt).getTime() : NaN;
    if (Number.isNaN(updatedAt)) {
      return 0;
    }
    const cooldownHours = Math.max(0, this.currentCompany.resubmissionCooldownHours ?? 72);
    const availableAt = updatedAt + cooldownHours * 60 * 60 * 1000;
    return Math.max(0, availableAt - Date.now());
  }

  get canResubmitRejectedCompany(): boolean {
    return this.isRejectedCompany && this.rejectionCooldownRemainingMs === 0;
  }

  get canSubmitReviewResubmission(): boolean {
    return this.isChangesRequestedCompany || this.canResubmitRejectedCompany;
  }

  get resubmissionCountdownLabel(): string {
    const remainingMs = this.rejectionCooldownRemainingMs;
    if (remainingMs <= 0) {
      return 'ahora mismo';
    }

    const totalHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0 && hours > 0) {
      return `${days} d ${hours} h`;
    }
    if (days > 0) {
      return `${days} d`;
    }
    return `${totalHours} h`;
  }

  get resubmissionCooldownHours(): number {
    return Math.max(0, this.currentCompany?.resubmissionCooldownHours ?? 72);
  }

  isRejectedField(fieldKey: string): boolean {
    return this.reviewItems.some(item => item.itemType === 'FIELD' && item.itemKey === fieldKey && item.status === 'REJECTED');
  }

  isRejectedDocument(documentKey: RegistrationDocumentType): boolean {
    return this.reviewItems.some(item => item.itemType === 'DOCUMENT' && item.itemKey === documentKey && item.status === 'REJECTED');
  }

  get rejectedFieldItems(): CompanyReviewItem[] {
    return this.reviewItems.filter(item => item.itemType === 'FIELD' && item.status === 'REJECTED');
  }

  get rejectedDocumentItems(): CompanyReviewItem[] {
    return this.reviewItems.filter(item => item.itemType === 'DOCUMENT' && item.status === 'REJECTED');
  }

  get hasRejectedFieldItems(): boolean {
    return this.rejectedFieldItems.length > 0;
  }

  get hasRejectedDocumentItems(): boolean {
    return this.rejectedDocumentItems.length > 0;
  }

  get canSaveRejectedDraft(): boolean {
    if (!this.currentCompany || !this.isChangesRequestedCompany || !this.hasRejectedFieldItems) {
      return false;
    }

    return (
      this.hasRejectedFieldValueChanged('companyName', this.currentCompany.companyName, this.form.companyName) ||
      this.hasRejectedFieldValueChanged('domain', this.currentCompany.domain, this.form.domain, true) ||
      this.hasRejectedFieldValueChanged('nit', this.currentCompany.nit, this.form.nit) ||
      this.hasRejectedFieldValueChanged('contactEmail', this.currentCompany.contactEmail, this.form.contactEmail, true)
    );
  }

  get rejectedItemsSummary(): string {
    return this.reviewItems
      .filter(item => item.status === 'REJECTED')
      .map(item => this.mapReviewItemLabel(item))
      .filter((label, index, labels) => labels.indexOf(label) === index)
      .join(', ');
  }

  getReviewComment(itemType: 'FIELD' | 'DOCUMENT', itemKey: string): string | null {
    return this.reviewItems.find(item => item.itemType === itemType && item.itemKey === itemKey)?.adminComment ?? null;
  }

  refreshView(): void {
    this.hasLoadedAccessData = false;
    this.allowedEmails = [];
    this.registrationDocuments = [];
    this.loadViewData();
  }

  setActiveTab(tabId: string): void {
    if (this.isCompanyMemberView && tabId === 'access') {
      this.activeTab = 'status';
      return;
    }
    if (tabId === 'status' || tabId === 'profile' || tabId === 'access') {
      this.activeTab = tabId;
      this.loadTabDataIfNeeded(tabId);
    }
  }

  submit(): void {
    if (!this.sessionUser) {
      this.message = { type: 'error', text: 'No pudimos identificar la sesión actual.' };
      return;
    }

    if (!this.validateCreateForm()) {
      this.message = { type: 'error', text: 'Completa los campos obligatorios marcados en el formulario.' };
      return;
    }

    this.isSaving = true;
    this.message = null;

    const payload: CreateCompanyDto = {
      ownerId: this.sessionUser.id,
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
      onboardingCompleted: true,
      ownerVerificationStatus: 'VERIFIED',
      verifiedOwnerEmail: this.sessionUser.email
    };

    this.companyService.createCompany(payload).subscribe({
      next: company => {
        this.currentCompany = company;
        this.isSaving = false;
        this.createFieldErrors = {};
        this.message = {
          type: 'success',
          text: 'Solicitud enviada. Queda pendiente de aprobacion del administrador.'
        };
        this.activeTab = 'profile';
        this.userSessionService.loadCurrentUser(true).subscribe();
      },
      error: error => {
        this.isSaving = false;
        const hasFieldErrors = this.applyCreateFieldErrorsFromResponse(error);
        this.message = {
          type: 'error',
          text: hasFieldErrors
            ? 'Revisa los campos marcados en el formulario.'
            : this.resolveErrorMessage(error, 'No pudimos registrar la empresa. Revisa los datos e intenta de nuevo.')
        };
      }
    });
  }

  saveProfile(): void {
    if (!this.currentCompany) {
      return;
    }

    const payload: UpdateCompanyProfileDto = {
      contactName: this.toNullable(this.form.contactName),
      contactPhone: this.canEditProfileField('contactPhone') ? this.toNullable(this.form.contactPhone) : null,
      website: this.canEditProfileField('website') ? this.toNullable(this.form.website) : null,
      description: this.canEditProfileField('description') ? this.toNullable(this.form.description) : null,
      address: this.canEditProfileField('address') ? this.toNullable(this.form.address) : null
    };

    this.isUpdatingProfile = true;
    this.companyService.updateCompanyProfile(payload).subscribe({
      next: company => {
        this.currentCompany = company;
        this.patchFormFromCompany(company);
        this.isUpdatingProfile = false;
        this.uiToastService.success('Perfil de empresa actualizado.');
      },
      error: error => {
        this.isUpdatingProfile = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar el perfil de la empresa.'));
      }
    });
  }

  resubmitRejectedCompany(): void {
    if (!this.currentCompany || !this.canSubmitReviewResubmission || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.companyService.resubmitCompanyProfile().subscribe({
      next: company => {
        this.currentCompany = company;
        this.patchFormFromCompany(company);
        this.isSaving = false;
        this.closeResubmissionModal();
        this.uiToastService.success('Solicitud reenviada. Ahora vuelve a quedar en revision administrativa.');
      },
      error: error => {
        this.isSaving = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos reenviar la solicitud.'));
      }
    });
  }

  openResubmissionModal(): void {
    if (!this.currentCompany || (!this.isRejectedCompany && !this.isChangesRequestedCompany)) {
      return;
    }
    this.isResubmissionModalOpen = true;
    this.loadRegistrationDocuments();
    this.loadReviewItems();
  }

  closeResubmissionModal(): void {
    this.isResubmissionModalOpen = false;
    this.uploadingDocumentType = null;
  }

  jumpToProfileReview(): void {
    this.closeResubmissionModal();
    this.setActiveTab('profile');
  }

  saveRejectedDraft(): void {
    if (!this.currentCompany || !this.isChangesRequestedCompany || this.isSavingRejectedDraft) {
      return;
    }

    if (!this.canSaveRejectedDraft) {
      this.uiToastService.error('No hay cambios nuevos para guardar en los campos observados.');
      return;
    }

    const payload: UpdateRejectedCompanyDraftDto = {
      companyName: this.form.companyName.trim(),
      nit: this.form.nit.trim(),
      contactEmail: this.form.contactEmail.trim(),
      domain: this.normalizeDomain(this.form.domain),
      contactName: null,
      contactPhone: null,
      website: null,
      description: null,
      address: null
    };

    this.isSavingRejectedDraft = true;
    this.companyService.updateRejectedCompanyDraft(payload).subscribe({
      next: company => {
        this.currentCompany = company;
        this.patchFormFromCompany(company);
        this.isSavingRejectedDraft = false;
        this.uiToastService.success('Cambios guardados para el nuevo reenvio.');
      },
      error: error => {
        this.isSavingRejectedDraft = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos guardar los cambios del borrador.'));
      }
    });
  }

  getRegistrationDocument(documentType: RegistrationDocumentType): CompanyRegistrationDocument | undefined {
    return this.registrationDocuments.find(document => document.documentType === documentType);
  }

  replaceRegistrationDocument(event: Event, documentType: RegistrationDocumentType): void {
    if (!this.currentCompany || !this.isChangesRequestedCompany) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.uploadingDocumentType = documentType;
    this.companyService.uploadCompanyProfileDocument(documentType, file).subscribe({
      next: document => {
        this.registrationDocuments = [
          ...this.registrationDocuments.filter(item => item.documentType !== document.documentType),
          document
        ];
        this.uploadingDocumentType = null;
        this.uiToastService.success('Documento actualizado correctamente.');
      },
      error: error => {
        this.uploadingDocumentType = null;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar ese documento.'));
      }
    });
  }

  downloadRegistrationDocument(document: CompanyRegistrationDocument): void {
    window.open(this.companyService.downloadRegistrationDocument(document.id), '_blank', 'noopener');
  }

  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    this.isUploadingLogo = true;
    this.companyService.uploadCompanyProfileLogo(file).subscribe({
      next: company => {
        this.currentCompany = company;
        this.patchFormFromCompany(company);
        this.isUploadingLogo = false;
        this.uiToastService.success('Imagen de perfil actualizada.');
      },
      error: error => {
        this.isUploadingLogo = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos actualizar la imagen de perfil.'));
      }
    });
  }

  addAllowedEmail(): void {
    const email = this.normalizeEmail(this.allowedEmailInput);
    if (!email) {
      this.uiToastService.error('Escribe un correo para habilitar.');
      return;
    }
    if (!this.matchesCompanyDomain(email)) {
      this.uiToastService.error(`Solo puedes habilitar correos del dominio ${this.companyDomain}.`);
      return;
    }

    this.isAddingAllowedEmail = true;
    this.companyAccessService.addAllowedEmail(email).subscribe({
      next: allowedEmail => {
        this.allowedEmails = this.sortAllowedEmails([allowedEmail, ...this.allowedEmails.filter(item => item.email !== allowedEmail.email)]);
        this.allowedEmailInput = '';
        this.isAddingAllowedEmail = false;
        this.uiToastService.success('Correo habilitado correctamente.');
      },
      error: error => {
        this.isAddingAllowedEmail = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos habilitar ese correo.'));
      }
    });
  }

  removeAllowedEmail(allowedEmail: CompanyAllowedEmail): void {
    this.companyAccessService.removeAllowedEmail(allowedEmail.email).subscribe({
      next: () => {
        this.allowedEmails = this.sortAllowedEmails(
          this.allowedEmails.map(item => item.id === allowedEmail.id ? { ...item, status: 'REMOVED' } : item)
        );
        this.uiToastService.success('Correo retirado correctamente.');
      },
      error: error => {
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos retirar ese correo.'));
      }
    });
  }

  private loadViewData(): void {
    this.isLoading = true;
    this.message = null;

    this.userSessionService.loadCurrentUser(true).subscribe({
      next: user => {
        this.sessionUser = user;
        (user?.companyId
          ? this.companyService.getCompany(user.companyId).pipe(catchError(() => of(null)))
          : of(null)
        ).subscribe({
          next: company => {
            this.currentCompany = company;
            if (company) {
              this.patchFormFromCompany(company);
              this.reviewItems = [];
              this.registrationDocuments = [];
              this.activeTab = 'status';
              this.loadTabDataIfNeeded(this.activeTab);
            } else {
              this.activeTab = 'profile';
            }
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.message = { type: 'error', text: 'No pudimos cargar la informacion de empresa.' };
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos validar la sesion de empresa.' };
      }
    });
  }

  private loadAccessGroup(): void {
    this.isAccessLoading = true;
    this.companyAccessService.listAllowedEmails().subscribe({
      next: allowedEmails => {
        this.allowedEmails = this.sortAllowedEmails(allowedEmails);
        this.isAccessLoading = false;
      },
      error: error => {
        this.isAccessLoading = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar los correos habilitados.'));
      }
    });
  }

  private loadTabDataIfNeeded(tab: CompanyTab): void {
    if (this.isCompanyMemberView && tab === 'access') {
      return;
    }
    if (!this.currentCompany || this.currentCompany.approvalStatus !== 'APPROVED') {
      return;
    }
    if (tab === 'access' && !this.hasLoadedAccessData) {
      this.hasLoadedAccessData = true;
      this.loadAccessGroup();
    }
  }

  private loadRegistrationDocuments(): void {
    if (!this.currentCompany) {
      this.registrationDocuments = [];
      return;
    }

    this.isDocumentsLoading = true;
    this.companyService.listCompanyProfileDocuments().subscribe({
      next: documents => {
        this.registrationDocuments = documents;
        this.isDocumentsLoading = false;
      },
      error: error => {
        this.registrationDocuments = [];
        this.isDocumentsLoading = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar los documentos de registro.'));
      }
    });
  }

  private loadReviewItems(): void {
    if (!this.currentCompany) {
      this.reviewItems = [];
      return;
    }

    this.isReviewItemsLoading = true;
    this.companyService.listCompanyProfileReviewItems().subscribe({
      next: items => {
        this.reviewItems = items;
        this.isReviewItemsLoading = false;
      },
      error: error => {
        this.reviewItems = [];
        this.isReviewItemsLoading = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos cargar los items de revision.'));
      }
    });
  }

  private mapReviewItemLabel(item: CompanyReviewItem): string {
    if (item.itemType === 'FIELD') {
      switch (item.itemKey) {
        case 'companyName':
          return 'Nombre de la empresa';
        case 'domain':
          return 'Dominio empresarial';
        case 'nit':
          return 'NIT';
        case 'contactEmail':
          return 'Correo de contacto';
        default:
          return item.itemKey;
      }
    }

    switch (item.itemKey) {
      case 'LEGAL_CERTIFICATE':
        return 'Certificado legal';
      case 'TAX_DOCUMENT':
        return 'Documento tributario';
      default:
        return item.itemKey;
    }
  }

  private hasRejectedFieldValueChanged(fieldKey: string, currentValue: string | null | undefined, nextValue: string | null | undefined, normalizeAsDomainOrEmail = false): boolean {
    if (!this.isRejectedField(fieldKey)) {
      return false;
    }

    const current = normalizeAsDomainOrEmail
      ? this.normalizeComparableValue(currentValue)
      : this.trimComparableValue(currentValue);
    const next = normalizeAsDomainOrEmail
      ? this.normalizeComparableValue(nextValue)
      : this.trimComparableValue(nextValue);

    return current !== next;
  }

  private trimComparableValue(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private normalizeComparableValue(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    if (!trimmed) {
      return null;
    }
    return this.normalizeDomain(trimmed);
  }

  private sortAllowedEmails(items: CompanyAllowedEmail[]): CompanyAllowedEmail[] {
    return [...items].sort((a, b) => a.email.localeCompare(b.email));
  }

  private patchFormFromCompany(company: Company): void {
    this.form.companyName = company.companyName ?? '';
    this.form.nit = company.nit ?? '';
    this.form.contactName = company.contactName ?? '';
    this.form.contactEmail = company.contactEmail ?? this.sessionUser?.email ?? '';
    this.form.contactPhone = company.contactPhone ?? '';
    this.form.website = company.website ?? '';
    this.form.domain = company.domain ?? '';
    this.form.description = company.description ?? '';
    this.form.address = company.address ?? '';
  }

  clearCreateFieldError(field: CreateField): void {
    if (!this.createFieldErrors[field]) {
      return;
    }
    const nextErrors = { ...this.createFieldErrors };
    delete nextErrors[field];
    this.createFieldErrors = nextErrors;
  }

  canEditProfileField(field: string): boolean {
    if (!this.currentCompany) {
      return false;
    }
    if (this.isCompanyMemberView) {
      return ['contactName', 'contactPhone', 'address'].includes(field);
    }
    return ['contactName', 'contactPhone', 'website', 'description', 'address'].includes(field);
  }

  private matchesCompanyDomain(email: string): boolean {
    const companyDomain = this.companyDomain;
    const emailDomain = this.extractDomain(email);
    return !!companyDomain && !!emailDomain && companyDomain === emailDomain;
  }

  private extractDomain(email: string): string {
    const normalized = this.normalizeEmail(email);
    const atIndex = normalized.lastIndexOf('@');
    if (atIndex < 0 || atIndex === normalized.length - 1) {
      return '';
    }
    return normalized.slice(atIndex + 1);
  }

  private normalizeDomain(value: string): string {
    return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  private normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  private toNullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private validateCreateForm(): boolean {
    const errors: Partial<Record<CreateField, string>> = {};

    if (!this.form.companyName.trim()) {
      errors.companyName = 'El nombre de la empresa es obligatorio.';
    }
    if (!this.form.domain.trim()) {
      errors.domain = 'El dominio empresarial es obligatorio.';
    }
    if (!this.form.nit.trim()) {
      errors.nit = 'El NIT es obligatorio.';
    }
    if (!this.form.contactEmail.trim()) {
      errors.contactEmail = 'El correo de contacto es obligatorio.';
    } else if (!this.isValidEmail(this.form.contactEmail)) {
      errors.contactEmail = 'Escribe un correo valido.';
    }

    this.createFieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  private applyCreateFieldErrorsFromResponse(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }
    const payload = error.error;
    if (!payload || typeof payload !== 'object' || !payload.fieldErrors || typeof payload.fieldErrors !== 'object') {
      return false;
    }

    const nextErrors: Partial<Record<CreateField, string>> = {};
    (['companyName', 'domain', 'nit', 'contactEmail'] as CreateField[]).forEach(field => {
      const value = payload.fieldErrors[field];
      if (typeof value === 'string' && value.trim()) {
        nextErrors[field] = value;
      }
    });

    if (Object.keys(nextErrors).length === 0) {
      return false;
    }

    this.createFieldErrors = nextErrors;
    return true;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return payload;
      }
      if (payload && typeof payload === 'object') {
        if (typeof payload.message === 'string' && payload.message.trim()) {
          return payload.message;
        }
        if (typeof payload.error === 'string' && payload.error.trim()) {
          return payload.error;
        }
      }
    }
    return fallback;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CompanyService } from '../../../companies/services/company.service';
import { Company, CompanyRegistrationDocument, CompanyReviewDecisionDto, CompanyReviewItem } from '../../../../shared/models/company.model';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

type MessageState = { type: 'success' | 'error'; text: string } | null;

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-companies.component.html'
})
export class AdminCompaniesComponent implements OnInit {
  activeTab = 'queue';
  isLoading = false;
  isSaving = false;
  isReviewModalOpen = false;
  isReviewDocumentsLoading = false;
  isReviewItemsLoading = false;
  message: MessageState = null;
  searchTerm = '';
  statusFilter: 'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'REJECTED' | 'APPROVED' = 'PENDING';
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  selectedCompanyDocuments: CompanyRegistrationDocument[] = [];
  selectedCompanyReviewItems: CompanyReviewItem[] = [];

  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-users', label: 'Usuarios', accent: 'accent-1', route: '/admin/users' },
    {
      id: 'company-approvals',
      label: 'Aprobacion de empresas',
      accent: 'accent-3',
      children: [
        { id: 'queue', label: 'Solicitudes', accent: 'accent-3', mobileBarWidthClass: 'w-24' }
      ]
    },
    { id: 'admin-pricing', label: 'Pricing', accent: 'accent-2', route: '/admin/project-pricing' },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' }
  ];

  constructor(
    private readonly companyService: CompanyService,
    private readonly toast: UiToastService
  ) {}

  ngOnInit(): void {
    this.refreshCompanies();
  }

  get pendingCompanies(): Company[] {
    return this.companies.filter(company => company.approvalStatus === 'PENDING');
  }

  get filteredCompanies(): Company[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    return this.sortedCompanies.filter(company => {
      const matchesStatus = this.statusFilter === 'ALL' || company.approvalStatus === this.statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        company.companyName,
        company.domain,
        company.contactEmail,
        company.verifiedOwnerEmail,
        company.contactName,
        company.nit
      ]
        .filter((value): value is string => !!value)
        .some(value => value.toLowerCase().includes(normalizedSearch));
    });
  }

  get sortedCompanies(): Company[] {
    const order: Record<string, number> = {
      PENDING: 0,
      CHANGES_REQUESTED: 1,
      REJECTED: 2,
      APPROVED: 3
    };

    return [...this.companies].sort((left, right) => {
      const leftOrder = order[left.approvalStatus] ?? 99;
      const rightOrder = order[right.approvalStatus] ?? 99;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.companyName.localeCompare(right.companyName);
    });
  }

  get approvedCompanies(): number {
    return this.companies.filter(company => company.approvalStatus === 'APPROVED').length;
  }

  get changesRequestedCompanies(): number {
    return this.companies.filter(company => company.approvalStatus === 'CHANGES_REQUESTED').length;
  }

  get selectedFieldReviewItems(): CompanyReviewItem[] {
    return this.selectedCompanyReviewItems.filter(item => item.itemType === 'FIELD');
  }

  get selectedDocumentReviewItems(): CompanyReviewItem[] {
    return this.selectedCompanyReviewItems.filter(item => item.itemType === 'DOCUMENT');
  }

  get selectedApprovedItemsCount(): number {
    return this.selectedCompanyReviewItems.filter(item => item.status === 'APPROVED').length;
  }

  get selectedRejectedItemsCount(): number {
    return this.selectedCompanyReviewItems.filter(item => item.status === 'REJECTED').length;
  }

  get selectedPendingItemsCount(): number {
    return this.selectedCompanyReviewItems.filter(item => item.status === 'PENDING').length;
  }

  get canApplyReviewSelected(): boolean {
    return !!this.selectedCompany && this.selectedCompany.approvalStatus === 'PENDING';
  }

  get isReviewModalLoading(): boolean {
    return this.isReviewDocumentsLoading || this.isReviewItemsLoading;
  }

  get hasPendingReviewItems(): boolean {
    return this.selectedCompanyReviewItems.some(item => item.status === 'PENDING');
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'queue') {
      this.activeTab = tabId;
    }
  }

  setStatusFilter(filter: 'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'REJECTED' | 'APPROVED'): void {
    this.statusFilter = filter;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.selectedCompanyDocuments = [];
    this.selectedCompanyReviewItems = [];
    this.isReviewDocumentsLoading = true;
    this.isReviewItemsLoading = true;
    this.message = null;
    this.loadCompanyDocuments(company);
    this.loadCompanyReviewItems(company);
  }

  openReviewModal(company: Company): void {
    this.selectCompany(company);
    this.isReviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.isReviewModalOpen = false;
  }

  refreshCompanies(): void {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: companies => {
        this.companies = companies;
        if (this.selectedCompany) {
          this.selectedCompany = companies.find(company => company.id === this.selectedCompany?.id) ?? null;
          if (this.selectedCompany) {
            this.loadCompanyDocuments(this.selectedCompany);
            this.loadCompanyReviewItems(this.selectedCompany);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos cargar las empresas registradas.' };
      }
    });
  }

  setReviewStatus(item: CompanyReviewItem, status: 'APPROVED' | 'REJECTED'): void {
    if (!this.canApplyReviewSelected) {
      return;
    }
    this.selectedCompanyReviewItems = this.selectedCompanyReviewItems.map(current =>
      current.id === item.id ? { ...current, status } : current
    );
  }

  applySelectedReview(): void {
    if (!this.canApplyReviewSelected || !this.selectedCompany) {
      return;
    }

    if (!this.selectedCompanyReviewItems.length) {
      this.toast.error('No hay items de revision para aplicar en esta empresa.');
      return;
    }

    if (this.hasPendingReviewItems) {
      this.toast.error('Debes decidir todos los items antes de aplicar la revision.');
      return;
    }

    this.isSaving = true;
    this.message = null;

    const payload: CompanyReviewDecisionDto = {
      items: this.selectedCompanyReviewItems.map(item => ({
        itemType: item.itemType,
        itemKey: item.itemKey,
        status: item.status,
        adminComment: null
      }))
    };

    this.companyService.applyCompanyReviewItems(this.selectedCompany.id, payload).subscribe({
      next: updated => {
        this.companies = this.companies.map(item => item.id === updated.id ? updated : item);
        this.selectedCompany = updated;
        this.isSaving = false;
        this.toast.success(
          updated.approvalStatus === 'APPROVED'
            ? 'La empresa quedo aprobada.'
            : updated.approvalStatus === 'CHANGES_REQUESTED'
              ? 'Se guardaron las correcciones solicitadas para el owner.'
              : 'La revision se guardo correctamente.'
        );
        this.message = {
          type: 'success',
          text: updated.approvalStatus === 'APPROVED'
            ? 'Empresa aprobada correctamente.'
            : updated.approvalStatus === 'CHANGES_REQUESTED'
              ? 'Se solicitaron correcciones a la empresa.'
              : 'Revision guardada correctamente.'
        };
        this.loadCompanyReviewItems(updated);
      },
      error: () => {
        this.isSaving = false;
        this.toast.error('No pudimos aplicar la revision. Revisa los items y vuelve a intentarlo.');
        this.message = { type: 'error', text: 'No pudimos aplicar la revision de la empresa.' };
      }
    });
  }

  downloadDocument(document: CompanyRegistrationDocument): void {
    window.open(this.companyService.downloadRegistrationDocument(document.id), '_blank', 'noopener');
  }

  companyStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Aprobada';
      case 'CHANGES_REQUESTED':
        return 'Correcciones';
      case 'REJECTED':
        return 'Rechazada';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  }

  companyStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'app-status-success';
      case 'CHANGES_REQUESTED':
        return 'border-[color:var(--accent-1)]/30 bg-[var(--accent-1)]/10 text-[var(--accent-1)]';
      case 'REJECTED':
        return 'app-status-danger';
      case 'PENDING':
        return 'app-status-warning';
      default:
        return 'border-[color:var(--panel-border)] bg-[var(--panel-2)] text-[var(--muted)]';
    }
  }

  reviewItemLabel(item: CompanyReviewItem): string {
    if (item.itemType === 'FIELD') {
      switch (item.itemKey) {
        case 'companyName':
          return 'Nombre de empresa';
        case 'domain':
          return 'Dominio';
        case 'nit':
          return 'NIT';
        case 'contactEmail':
          return 'Correo de contacto';
        default:
          return item.itemKey;
      }
    }

    return item.itemKey === 'LEGAL_CERTIFICATE' ? 'Certificado legal' : 'Documento tributario';
  }

  reviewItemStatusClass(status: CompanyReviewItem['status']): string {
    switch (status) {
      case 'APPROVED':
        return 'text-[var(--status-success-text)]';
      case 'REJECTED':
        return 'text-[var(--status-danger-text)]';
      default:
        return 'text-[var(--status-warning-text)]';
    }
  }

  reviewItemSurfaceClass(status: CompanyReviewItem['status']): string {
    switch (status) {
      case 'APPROVED':
        return 'app-status-success';
      case 'REJECTED':
        return 'app-status-danger';
      default:
        return 'border-[color:var(--panel-border)] bg-[var(--panel-2)]';
    }
  }

  documentLabel(documentType: CompanyRegistrationDocument['documentType']): string {
    return documentType === 'LEGAL_CERTIFICATE' ? 'Certificado legal' : 'Documento tributario';
  }

  reviewItemCurrentValue(item: CompanyReviewItem): string {
    if (!this.selectedCompany) {
      return 'Sin dato';
    }

    if (item.itemType === 'FIELD') {
      switch (item.itemKey) {
        case 'companyName':
          return this.selectedCompany.companyName || 'Sin dato';
        case 'domain':
          return this.selectedCompany.domain || 'Sin dato';
        case 'nit':
          return this.selectedCompany.nit || 'Sin dato';
        case 'contactEmail':
          return this.selectedCompany.contactEmail || this.selectedCompany.verifiedOwnerEmail || 'Sin dato';
        default:
          return 'Sin dato';
      }
    }

    return this.reviewItemDocument(item)?.fileName || 'Sin archivo';
  }

  reviewItemDocument(item: CompanyReviewItem): CompanyRegistrationDocument | undefined {
    if (item.itemType !== 'DOCUMENT') {
      return undefined;
    }
    return this.selectedCompanyDocuments.find(document => document.documentType === item.itemKey);
  }

  private loadCompanyDocuments(company: Company): void {
    if (!company.id) {
      return;
    }
    this.companyService.listRegistrationDocumentsByCompany(company.id).subscribe({
      next: documents => {
        this.selectedCompanyDocuments = documents;
        this.isReviewDocumentsLoading = false;
      },
      error: () => {
        this.selectedCompanyDocuments = [];
        this.isReviewDocumentsLoading = false;
      }
    });
  }

  private loadCompanyReviewItems(company: Company): void {
    this.companyService.getCompanyReviewItems(company.id).subscribe({
      next: items => {
        this.selectedCompanyReviewItems = items;
        this.isReviewItemsLoading = false;
      },
      error: () => {
        this.selectedCompanyReviewItems = [];
        this.isReviewItemsLoading = false;
      }
    });
  }
}

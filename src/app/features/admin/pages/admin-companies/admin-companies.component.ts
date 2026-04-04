import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CompanyService } from '../../../companies/services/company.service';
import { Company, CompanyRegistrationDocument, CompanyReviewDecisionDto, CompanyReviewItem } from '../../../../shared/models/company.model';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';

type MessageState = { type: 'success' | 'error'; text: string } | null;

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DashboardShellComponent],
  templateUrl: './admin-companies.component.html'
})
export class AdminCompaniesComponent implements OnInit {
  activeTab = 'queue';
  isLoading = false;
  isSaving = false;
  message: MessageState = null;
  companies: Company[] = [];
  selectedCompany: Company | null = null;
  selectedCompanyDocuments: CompanyRegistrationDocument[] = [];
  selectedCompanyReviewItems: CompanyReviewItem[] = [];

  readonly navItems: DashboardNavItem[] = [
    { id: 'queue', label: 'Solicitudes', accent: 'accent-3', mobileBarWidthClass: 'w-24' }
  ];

  constructor(private readonly companyService: CompanyService) {}

  ngOnInit(): void {
    this.refreshCompanies();
  }

  get pendingCompanies(): Company[] {
    return this.companies.filter(company => company.approvalStatus === 'PENDING');
  }

  get approvedCompanies(): number {
    return this.companies.filter(company => company.approvalStatus === 'APPROVED').length;
  }

  get changesRequestedCompanies(): number {
    return this.companies.filter(company => company.approvalStatus === 'CHANGES_REQUESTED').length;
  }

  get canApplyReviewSelected(): boolean {
    return !!this.selectedCompany && this.selectedCompany.approvalStatus === 'PENDING';
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'queue') {
      this.activeTab = tabId;
    }
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.selectedCompanyDocuments = [];
    this.selectedCompanyReviewItems = [];
    this.message = null;
    this.loadCompanyDocuments(company);
    this.loadCompanyReviewItems(company);
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
        this.message = { type: 'error', text: 'No pudimos aplicar la revision de la empresa.' };
      }
    });
  }

  downloadDocument(document: CompanyRegistrationDocument): void {
    window.open(this.companyService.downloadRegistrationDocument(document.id), '_blank', 'noopener');
  }

  private loadCompanyDocuments(company: Company): void {
    if (!company.id) {
      return;
    }
    this.companyService.listRegistrationDocumentsByCompany(company.id).subscribe({
      next: documents => {
        this.selectedCompanyDocuments = documents;
      },
      error: () => {
        this.selectedCompanyDocuments = [];
      }
    });
  }

  private loadCompanyReviewItems(company: Company): void {
    this.companyService.getCompanyReviewItems(company.id).subscribe({
      next: items => {
        this.selectedCompanyReviewItems = items;
      },
      error: () => {
        this.selectedCompanyReviewItems = [];
      }
    });
  }
}

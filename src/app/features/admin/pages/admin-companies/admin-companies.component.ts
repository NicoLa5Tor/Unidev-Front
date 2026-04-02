import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CompanyService } from '../../../companies/services/company.service';
import { Company, CompanyRegistrationDocument, CreateCompanyDto } from '../../../../shared/models/company.model';
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
  approvalMessage = '';

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

  setActiveTab(tabId: string): void {
    if (tabId === 'queue') {
      this.activeTab = tabId;
    }
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.selectedCompanyDocuments = [];
    this.approvalMessage = '';
    this.message = null;
    this.loadCompanyDocuments(company);
  }

  refreshCompanies(): void {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: companies => {
        this.companies = companies;
        if (this.selectedCompany) {
          this.selectedCompany = companies.find(company => company.id === this.selectedCompany?.id) ?? null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos cargar las empresas registradas.' };
      }
    });
  }

  approveSelected(): void {
    if (!this.selectedCompany) {
      return;
    }
    this.saveStatus(this.selectedCompany, 'APPROVED');
  }

  rejectSelected(): void {
    if (!this.selectedCompany) {
      return;
    }
    this.saveStatus(this.selectedCompany, 'REJECTED');
  }

  private saveStatus(company: Company, approvalStatus: string): void {
    this.isSaving = true;
    this.message = null;

    const payload: CreateCompanyDto = {
      ownerId: company.ownerId,
      planId: company.planId,
      companyName: company.companyName,
      nit: company.nit,
      contactName: company.contactName,
      contactEmail: company.contactEmail,
      authProvider: company.authProvider,
      contactPhone: company.contactPhone,
      website: company.website,
      domain: company.domain,
      description: company.description,
      address: company.address,
      onboardingCompleted: company.onboardingCompleted,
      approvalStatus,
      subscriptionStatus: company.subscriptionStatus,
      ownerVerificationStatus: company.ownerVerificationStatus,
      verifiedOwnerEmail: company.verifiedOwnerEmail,
      adminMessage: this.approvalMessage.trim() || null
    };

    this.companyService.updateCompany(company.id, payload).subscribe({
      next: updated => {
        this.companies = this.companies.map(item => item.id === updated.id ? updated : item);
        this.selectedCompany = updated;
        this.approvalMessage = '';
        this.isSaving = false;
        this.message = {
          type: 'success',
          text: approvalStatus === 'APPROVED'
            ? 'Empresa aprobada correctamente.'
            : 'Empresa rechazada correctamente.'
        };
      },
      error: () => {
        this.isSaving = false;
        this.message = { type: 'error', text: 'No pudimos actualizar el estado de la empresa.' };
      }
    });
  }

  downloadDocument(document: CompanyRegistrationDocument): void {
    window.open(this.companyService.downloadRegistrationDocument(document.id), '_blank', 'noopener');
  }

  private loadCompanyDocuments(company: Company): void {
    if (!company.verifiedOwnerEmail) {
      return;
    }
    this.companyService.listRegistrationDocuments(company.verifiedOwnerEmail).subscribe({
      next: documents => {
        this.selectedCompanyDocuments = documents;
      },
      error: () => {
        this.selectedCompanyDocuments = [];
      }
    });
  }
}

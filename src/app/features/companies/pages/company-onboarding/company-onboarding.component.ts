import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserSessionService } from '../../../../core/services/user-session.service';
import { Company, CreateCompanyDto } from '../../../../shared/models/company.model';
import { SessionUser } from '../../../../shared/models/session-user.model';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { HeaderComponent } from '../../../landing/components/header/header.component';
import { CompanyService } from '../../services/company.service';

type CompanyTab = 'onboarding' | 'status';
type MessageState = { type: 'success' | 'error'; text: string } | null;

interface CompanyFormModel {
  companyName: string;
  nit: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  domain: string;
  description: string;
  address: string;
}

@Component({
  selector: 'app-company-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent, HeaderComponent],
  templateUrl: './company-onboarding.component.html'
})
export class CompanyOnboardingComponent implements OnInit {
  activeTab: CompanyTab = 'onboarding';
  isLoading = false;
  isSaving = false;
  message: MessageState = null;
  sessionUser: SessionUser | null = null;
  currentCompany: Company | null = null;

  readonly navItems: DashboardNavItem[] = [
    { id: 'onboarding', label: 'Registro', accent: 'accent-1', mobileBarWidthClass: 'w-20' },
    { id: 'status', label: 'Estado', accent: 'accent-3', mobileBarWidthClass: 'w-16' }
  ];

  form: CompanyFormModel = {
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
    private readonly userSessionService: UserSessionService
  ) {}

  ngOnInit(): void {
    this.loadViewData();
  }

  get isPendingApproval(): boolean {
    return this.currentCompany?.approvalStatus === 'PENDING';
  }

  get canSubmit(): boolean {
    return !!this.sessionUser && !this.currentCompany;
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'onboarding' || tabId === 'status') {
      this.activeTab = tabId;
    }
  }

  submit(): void {
    if (!this.sessionUser) {
      this.message = { type: 'error', text: 'No pudimos identificar la sesión actual.' };
      return;
    }

    if (!this.form.companyName.trim() || !this.form.domain.trim() || !this.form.contactEmail.trim()) {
      this.message = { type: 'error', text: 'Nombre, dominio y correo de contacto son obligatorios.' };
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
        this.message = {
          type: 'success',
          text: 'Solicitud enviada. Queda pendiente de aprobacion del administrador.'
        };
        this.activeTab = 'status';
        this.userSessionService.loadCurrentUser(true).subscribe();
      },
      error: () => {
        this.isSaving = false;
        this.message = { type: 'error', text: 'No pudimos registrar la empresa. Revisa los datos e intenta de nuevo.' };
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
              this.activeTab = 'status';
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

  private patchFormFromCompany(company: Company): void {
    this.form = {
      companyName: company.companyName ?? '',
      nit: company.nit ?? '',
      contactName: company.contactName ?? '',
      contactEmail: company.contactEmail ?? this.sessionUser?.email ?? '',
      contactPhone: company.contactPhone ?? '',
      website: company.website ?? '',
      domain: company.domain ?? '',
      description: company.description ?? '',
      address: company.address ?? ''
    };
  }

  private normalizeDomain(value: string): string {
    return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  private toNullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}

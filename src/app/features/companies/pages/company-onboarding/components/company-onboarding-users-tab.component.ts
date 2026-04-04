import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Company } from '../../../../../shared/models/company.model';
import { User } from '../../../../../shared/models/user.model';
import { CompanyUserFormModel } from '../company-onboarding.types';

@Component({
  selector: 'app-company-onboarding-users-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-onboarding-users-tab.component.html'
})
export class CompanyOnboardingUsersTabComponent {
  @Input() currentCompany: Company | null = null;
  @Input() isApprovedCompany = false;
  @Input() companyUsers: User[] = [];
  @Input() companyDomain = '';
  @Input() isUsersLoading = false;
  @Input() isCreatingCompanyUser = false;
  @Input({ required: true }) companyUserForm!: CompanyUserFormModel;
  @Output() readonly createUser = new EventEmitter<void>();
}

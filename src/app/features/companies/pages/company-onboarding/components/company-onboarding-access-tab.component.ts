import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Company } from '../../../../../shared/models/company.model';
import { CompanyAllowedEmail } from '../../../../../shared/models/company-access.model';

@Component({
  selector: 'app-company-onboarding-access-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-onboarding-access-tab.component.html'
})
export class CompanyOnboardingAccessTabComponent {
  @Input() currentCompany: Company | null = null;
  @Input() isApprovedCompany = false;
  @Input() allowedEmails: CompanyAllowedEmail[] = [];
  @Input() companyDomain = '';
  @Input() isAccessLoading = false;
  @Input() isAddingAllowedEmail = false;
  @Input() allowedEmailInput = '';
  @Output() readonly allowedEmailInputChange = new EventEmitter<string>();
  @Output() readonly addEmail = new EventEmitter<void>();
  @Output() readonly removeEmail = new EventEmitter<CompanyAllowedEmail>();
}

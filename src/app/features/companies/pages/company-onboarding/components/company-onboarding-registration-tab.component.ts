import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Company } from '../../../../../shared/models/company.model';
import { SessionUser } from '../../../../../shared/models/session-user.model';
import { CompanyFormModel } from '../company-onboarding.types';

@Component({
  selector: 'app-company-onboarding-registration-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-onboarding-registration-tab.component.html'
})
export class CompanyOnboardingRegistrationTabComponent {
  @Input() currentCompany: Company | null = null;
  @Input() sessionUser: SessionUser | null = null;
  @Input() companyDomain = '';
  @Input() canSubmit = false;
  @Input() isSaving = false;
  @Input({ required: true }) form!: CompanyFormModel;
  @Output() readonly submitForm = new EventEmitter<void>();
}

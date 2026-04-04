import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Company } from '../../../../../shared/models/company.model';
import { SessionUser } from '../../../../../shared/models/session-user.model';

@Component({
  selector: 'app-company-onboarding-status-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-onboarding-status-tab.component.html'
})
export class CompanyOnboardingStatusTabComponent {
  @Input() currentCompany: Company | null = null;
  @Input() sessionUser: SessionUser | null = null;
}

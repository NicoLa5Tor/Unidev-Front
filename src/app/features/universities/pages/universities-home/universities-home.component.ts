import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgZone } from '@angular/core';

import { ScriptLoaderService } from '../../../../shared/services/script-loader.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { CompanyService } from '../../../companies/services/company.service';
import { CompaniesHomeComponent } from '../../../companies/pages/companies-home/companies-home.component';

@Component({
  selector: 'app-universities-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './universities-home.component.html',
  styleUrl: './universities-home.component.scss'
})
export class UniversitiesHomeComponent extends CompaniesHomeComponent {
  constructor(
    companyService: CompanyService,
    router: Router,
    route: ActivatedRoute,
    scriptLoader: ScriptLoaderService,
    ngZone: NgZone,
    toast: UiToastService
  ) {
    super(companyService, router, route, scriptLoader, ngZone, toast);
  }
}

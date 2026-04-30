import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import {
  PlatformConfig,
  PlatformConfigPayload,
  ProjectPricingLevel,
  ProjectPricingLevelPayload,
  ProjectPricingRate,
  ProjectPricingRatePayload
} from '../../../shared/models/project-pricing-rate.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectPricingRateService {
  private readonly pricingRatesUrl = `${environment.apiUrl}/project-pricing-rates`;
  private readonly pricingLevelsUrl = `${environment.apiUrl}/project-pricing-levels`;
  private readonly platformConfigUrl = `${environment.apiUrl}/platform-config`;

  constructor(private readonly http: HttpClient) {}

  getPricingRates(activeOnly = false) {
    return this.http.get<ProjectPricingRate[]>(`${this.pricingRatesUrl}?activeOnly=${activeOnly}`);
  }

  getPricingLevels(activeOnly = false) {
    return this.http.get<ProjectPricingLevel[]>(`${this.pricingLevelsUrl}?activeOnly=${activeOnly}`);
  }

  createPricingRate(payload: ProjectPricingRatePayload) {
    return this.http.post<ProjectPricingRate>(this.pricingRatesUrl, payload);
  }

  updatePricingRate(rateId: number, payload: ProjectPricingRatePayload) {
    return this.http.put<ProjectPricingRate>(`${this.pricingRatesUrl}/${rateId}`, payload);
  }

  createPricingLevel(payload: ProjectPricingLevelPayload) {
    return this.http.post<ProjectPricingLevel>(this.pricingLevelsUrl, payload);
  }

  updatePricingLevel(levelId: number, payload: ProjectPricingLevelPayload) {
    return this.http.put<ProjectPricingLevel>(`${this.pricingLevelsUrl}/${levelId}`, payload);
  }

  getPlatformConfig() {
    return this.http.get<PlatformConfig>(this.platformConfigUrl);
  }

  updatePlatformConfig(payload: PlatformConfigPayload) {
    return this.http.put<PlatformConfig>(this.platformConfigUrl, payload);
  }
}

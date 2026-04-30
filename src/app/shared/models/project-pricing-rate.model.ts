export interface ProjectPricingLevel {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
  productivityPercentage: number;
  computedHourlyRate: number | null;
  computedCurrency: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PlatformConfig {
  smlvAmount: number;
  smlvCurrency: string;
  workingHoursPerMonth: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PlatformConfigPayload {
  smlvAmount: number;
  smlvCurrency: string;
  workingHoursPerMonth: number;
}

export interface ProjectPricingLevelPayload {
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
  productivityPercentage: number;
}

export interface ProjectPricingRate {
  id: number;
  levelId: number;
  levelCode: string;
  levelDisplayName: string;
  levelActive: boolean;
  currency: string;
  hourlyRate: number;
  active: boolean;
  effectiveFrom: string;
}

export interface ProjectPricingRatePayload {
  levelId: number;
  currency: string;
  hourlyRate: number;
  active: boolean;
  effectiveFrom: string | null;
}

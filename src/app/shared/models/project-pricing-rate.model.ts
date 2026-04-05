export interface ProjectPricingLevel {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
}

export interface ProjectPricingLevelPayload {
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
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

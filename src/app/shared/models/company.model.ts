export interface CompanyOption {
  id: number;
  companyName: string;
  domain: string;
}

export interface Company {
  id: number;
  ownerId: number | null;
  planId: number | null;
  planCode: string | null;
  planName: string | null;
  companyName: string;
  nit: string | null;
  contactName: string | null;
  contactEmail: string | null;
  authProvider: string;
  contactPhone: string | null;
  website: string | null;
  domain: string;
  description: string | null;
  address: string | null;
  approvalStatus: string;
  subscriptionStatus: string;
  ownerVerificationStatus: string;
  verifiedOwnerEmail: string | null;
  onboardingCompleted: boolean;
}

export interface CreateCompanyDto {
  ownerId: number | null;
  planId: number | null;
  companyName: string;
  nit: string | null;
  contactName: string | null;
  contactEmail: string | null;
  authProvider: string;
  contactPhone: string | null;
  website: string | null;
  domain: string;
  description: string | null;
  address: string | null;
  onboardingCompleted: boolean;
  approvalStatus?: string | null;
  subscriptionStatus?: string | null;
  ownerVerificationStatus?: string | null;
  verifiedOwnerEmail?: string | null;
  adminMessage?: string | null;
}

export interface CompanyOtpRequestDto {
  email: string;
}

export interface CompanyOtpVerifyDto {
  email: string;
  code: string;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  maxUsers: number | null;
  priceAmount: number;
  displayOrder: number;
  active: boolean;
}

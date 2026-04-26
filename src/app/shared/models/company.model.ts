export interface CompanyOption {
  id: number;
  companyName: string;
  domain: string;
  organizationType?: 'COMPANY' | 'UNIVERSITY';
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
  contactPhone: string | null;
  website: string | null;
  domain: string;
  organizationType: 'COMPANY' | 'UNIVERSITY';
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  resubmissionCooldownHours?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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
  contactPhone: string | null;
  website: string | null;
  domain: string;
  organizationType?: 'COMPANY' | 'UNIVERSITY' | null;
  description: string | null;
  address: string | null;
  onboardingCompleted: boolean;
  approvalStatus?: string | null;
  subscriptionStatus?: string | null;
  ownerVerificationStatus?: string | null;
  verifiedOwnerEmail?: string | null;
  adminMessage?: string | null;
}

export interface UpdateCompanyProfileDto {
  contactName?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  description?: string | null;
  address?: string | null;
}

export interface UpdateRejectedCompanyDraftDto {
  companyName: string;
  nit: string;
  contactName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  domain: string;
  description?: string | null;
  address?: string | null;
}

export interface CompanyOtpRequestDto {
  email: string;
}

export interface CompanyOtpFlowResponseDto {
  action: 'OTP_SENT' | 'VERIFY_OTP' | 'CONTINUE_COMPANY' | 'GO_TO_LOGIN' | 'PENDING_REVIEW';
  message: string;
}

export interface CompanyOtpVerifyDto {
  email: string;
  code: string;
}

export interface CompanyRegistrationDocument {
  id: number;
  documentType: 'LEGAL_CERTIFICATE' | 'TAX_DOCUMENT';
  fileName: string;
  contentType: string;
  fileSize: number;
  status: string;
}

export interface CompanyReviewItem {
  id: number;
  itemType: 'FIELD' | 'DOCUMENT';
  itemKey: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment: string | null;
  reviewedAt: string | null;
}

export interface CompanyReviewDecisionDto {
  items: Array<{
    itemType: string;
    itemKey: string;
    status: string;
    adminComment?: string | null;
  }>;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  maxUsers: number | null;
  accessMode: 'MANAGED_GROUP' | 'DOMAIN_WIDE';
  priceAmount: number;
  displayOrder: number;
  active: boolean;
}

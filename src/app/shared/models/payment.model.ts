export type PaymentStatus = 'PENDING_PAYMENT' | 'PAID_HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED';

export interface FeePreview {
  amount: number;
  currency: string;
  companyFeePct: number;
  companyFeeAmount: number;
  companyTotalAmount: number;
  executorCommissionPct: number;
  commissionAmount: number;
  freelancerAmount: number;
}

export interface CommissionTier {
  id: number;
  displayName: string;
  minAmount: number;
  maxAmount: number | null;
  executorCommissionPct: number;
  companyFeePct: number;
  totalTakeRate: number;
  currency: string;
  active: boolean;
}

export interface CommissionTierPayload {
  displayName: string;
  minAmount: number;
  maxAmount: number | null;
  executorCommissionPct: number;
  companyFeePct: number;
  currency: string;
}

export interface CheckoutResponse {
  paymentId: number;
  checkoutUrl: string;
  amount: number;
  currency: string;
  companyFeePct: number;
  companyFeeAmount: number;
  companyTotalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  freelancerAmount: number;
}

export interface ProjectPaymentResponse {
  id: number;
  projectId: number;
  status: PaymentStatus;
  mpStatus: string | null;
  amount: number;
  currency: string;
  companyFeePct: number | null;
  companyFeeAmount: number | null;
  companyTotalAmount: number | null;
  commissionPercentage: number;
  commissionAmount: number;
  freelancerAmount: number;
  createdAt: string;
  paidAt: string | null;
  releasedAt: string | null;
  mpTransferId: string | null;
}

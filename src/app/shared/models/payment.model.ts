export type PaymentStatus = 'PENDING_PAYMENT' | 'PAID_HELD' | 'RELEASED' | 'FAILED';

export interface CheckoutResponse {
  paymentId: number;
  checkoutUrl: string;
  amount: number;
  currency: string;
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
  commissionPercentage: number;
  commissionAmount: number;
  freelancerAmount: number;
  createdAt: string;
  paidAt: string | null;
  releasedAt: string | null;
}

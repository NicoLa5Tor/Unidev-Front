export type DeploymentStatus =
  | 'PENDING'
  | 'BUILDING'
  | 'READY'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'FAILED'
  | 'TRASHED';

export type SubdomainStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED';

export type PhaseStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';

export interface DeploymentPhase {
  name: string;
  label: string;
  status: PhaseStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  message?: string | null;
  logs?: string | null;
}

export interface Deployment {
  id: string;
  subdomain: string;
  url: string;
  status: DeploymentStatus;
  buildLogs: string | null;
  errorMessage: string | null;
  createdAt: string;
  readyAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;
  publishDescription: string | null;
  phases: DeploymentPhase[];
  projectId?: number | null;
  projectName?: string | null;
  applicationId?: number | null;
}

export interface SubdomainCheck {
  value: string;
  status: SubdomainStatus;
}

export interface ApplicationDeliveryChatMessage {
  id: number;
  applicationId: number;
  senderUserId: number;
  senderDisplayName: string;
  senderRole: 'STUDENT' | 'COMPANY';
  textBody: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: 'IMAGE' | 'VIDEO' | 'DOC' | null;
  createdAt: string;
}

export interface ApplicationDeliveryChatThread {
  applicationId: number;
  projectId: number | null;
  projectName: string | null;
  studentDisplayName: string | null;
  companyName: string | null;
  publishedDeployments: Deployment[];
  messages: ApplicationDeliveryChatMessage[];
}

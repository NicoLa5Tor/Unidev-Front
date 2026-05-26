export type DeploymentStatus =
  | 'PENDING'
  | 'BUILDING'
  | 'READY'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'FAILED';

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
  phases: DeploymentPhase[];
}

export interface SubdomainCheck {
  value: string;
  status: SubdomainStatus;
}

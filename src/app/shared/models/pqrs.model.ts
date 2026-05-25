export type PqrsType = 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA';
export type PqrsStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface Pqrs {
  id: number;
  type: PqrsType;
  subject: string;
  message: string;
  status: PqrsStatus;
  submitterEmail: string | null;
  submitterName: string | null;
  submitterRole: string | null;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
}

export interface PqrsRequest {
  type: PqrsType;
  subject: string;
  message: string;
}

export interface PqrsReplyRequest {
  response: string;
  close: boolean;
}

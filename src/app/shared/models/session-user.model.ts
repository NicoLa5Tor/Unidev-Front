export interface SessionUser {
  id: number;
  displayName: string;
  email: string;
  companyId: number | null;
  roleName: string;
  career?: string | null;
  semester?: number | null;
  bio?: string | null;
}

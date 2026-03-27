export interface SessionUser {
  id: number;
  displayName: string;
  email: string;
  companyId: number | null;
  roleName: string;
}

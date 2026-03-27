export interface User {
  id: number;
  nombre: string | null;
  displayName: string | null;
  email: string;
  sub: string;
  provider: string | null;
  issuer: string | null;
  edad: number | null;
  walletPhone: string | null;
  idType: string | null;
  idNumber: string | null;
  companyId: number | null;
  roleId: number | null;
  roleName: string | null;
}

export interface CreateUserDto {
  nombre?: string | null;
  displayName?: string | null;
  email: string;
  sub: string;
  provider?: string | null;
  issuer?: string | null;
  edad?: number | null;
  walletPhone?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  roleId: number;
  companyId?: number | null;
}

export type UpdateUserDto = CreateUserDto;

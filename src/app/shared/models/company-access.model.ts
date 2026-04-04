export interface CompanyAllowedEmail {
  id: number;
  companyId: number;
  email: string;
  status: string;
}

export interface CreateCompanyUserDto {
  nombre?: string | null;
  displayName?: string | null;
  email: string;
  walletPhone?: string | null;
  idType?: string | null;
  idNumber?: string | null;
}

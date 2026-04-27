export interface SessionUser {
  id: number;
  displayName: string;
  email: string;
  companyId: number | null;
  roleName: string;
  career?: string | null;
  semester?: number | null;
  bio?: string | null;
  photoUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  skills?: string | null;
  city?: string | null;
  availableForProjects?: boolean | null;
  campusId?: number | null;
  campusName?: string | null;
}

export interface StudentTeamMember {
  userId: number;
  displayName: string;
  email: string;
  career: string | null;
  semester: number | null;
  role: 'LEADER' | 'MEMBER';
  joinedAt: string;
}

export interface StudentTeam {
  id: number;
  name: string;
  description: string | null;
  universityId: number;
  universityName: string;
  leaderId: number;
  leaderDisplayName: string;
  createdAt: string;
  members: StudentTeamMember[];
}

export interface CreateStudentTeamDto {
  name: string;
  description?: string | null;
}

export interface AddTeamMemberDto {
  email: string;
}

export interface ApplyToProjectDto {
  message?: string | null;
  teamId?: number | null;
}

export interface ProjectApplication {
  id: number;
  projectId: number;
  projectName: string;
  companyName: string | null;
  applicantUserId: number;
  applicantDisplayName: string;
  applicantEmail: string;
  applicantCareer: string | null;
  applicantSemester: number | null;
  teamId: number | null;
  teamName: string | null;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface StudentProfileUpdateDto {
  career?: string | null;
  semester?: number | null;
  bio?: string | null;
}

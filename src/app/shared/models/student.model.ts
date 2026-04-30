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
  campusId: number | null;
  campusName: string | null;
  tutorId: number | null;
  tutorDisplayName: string | null;
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
  projectDescription?: string | null;
  companyName: string | null;
  applicantUserId: number;
  applicantDisplayName: string;
  applicantEmail: string;
  applicantCareer: string | null;
  applicantSemester: number | null;
  applicantBio?: string | null;
  teamId: number | null;
  teamName: string | null;
  teamDescription?: string | null;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface StudentProfileUpdateDto {
  career?: string | null;
  semester?: number | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  skills?: string | null;
  city?: string | null;
  availableForProjects?: boolean | null;
  campusId?: number | null;
}

export interface TeamInvitation {
  id: number;
  teamId: number;
  teamName: string;
  fromUserId: number;
  fromUserDisplayName: string;
  fromUserEmail: string;
  toUserId: number;
  toUserDisplayName: string;
  toUserEmail: string;
  /** 'LEADER_INVITE' | 'JOIN_REQUEST' */
  type: string;
  /** 'PENDING' | 'ACCEPTED' | 'REJECTED' */
  status: string;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface TeamInviteDto {
  email: string;
  message?: string | null;
}

export interface TeamJoinRequestDto {
  message?: string | null;
}

export type ApplicationStatus = 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED';
export type NegotiationSenderRole = 'STUDENT' | 'COMPANY';

export interface ApplicationNegotiationMessage {
  id: number;
  applicationId: number;
  senderUserId: number;
  senderRole: NegotiationSenderRole;
  senderDisplayName: string | null;
  message: string | null;
  proposedAmount: number | null;
  proposedCurrency: string | null;
  acceptedProposal: boolean | null;
  acceptedByRole: NegotiationSenderRole | null;
  acceptedAt: string | null;
  createdAt: string;
}

export interface ApplicationNegotiationThread {
  applicationId: number;
  projectId: number;
  projectName: string;
  companyName: string | null;
  applicantDisplayName: string | null;
  applicationStatus: ApplicationStatus;
  projectStatus: string | null;
  negotiationCurrency: string | null;
  officialPriceAmount: number | null;
  acceptedProposalMessageId: number | null;
  acceptedProposalAmount: number | null;
  acceptedProposalCurrency: string | null;
  acceptedProposalAcceptedByRole: 'STUDENT' | 'COMPANY' | null;
  canSendMessages: boolean;
  lockedReason: string | null;
  messagesCount: number;
  lastMessageAt: string | null;
  messages: ApplicationNegotiationMessage[];
}

export interface ApplicantProjectExperience {
  projectId: number;
  projectName: string;
  projectDescription: string | null;
  companyName: string | null;
  projectStatus: string | null;
  applicationStatus: ApplicationStatus;
  teamId: number | null;
  teamName: string | null;
  appliedAt: string;
}

export interface ApplicantProfile {
  applicationId: number;
  applicantUserId: number;
  displayName: string | null;
  email: string;
  photoUrl: string | null;
  career: string | null;
  semester: number | null;
  bio: string | null;
  skills: string | null;
  city: string | null;
  availableForProjects: boolean | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  teamId: number | null;
  teamName: string | null;
  teamDescription: string | null;
  projectHistory: ApplicantProjectExperience[];
}

export interface ProjectApplication {
  id: number;
  projectId: number;
  projectName: string;
  projectDescription: string | null;
  companyName: string | null;
  applicantUserId: number;
  applicantDisplayName: string | null;
  applicantEmail: string;
  applicantCareer: string | null;
  applicantSemester: number | null;
  applicantBio: string | null;
  applicantSkills: string | null;
  applicantCity: string | null;
  applicantAvailableForProjects: boolean | null;
  acceptedProjectsCount: number;
  teamId: number | null;
  teamName: string | null;
  teamDescription: string | null;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

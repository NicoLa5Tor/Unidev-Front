export interface CreateRatingRequest {
  score: number;
  comment?: string | null;
}

export interface RatingResponse {
  id: number;
  projectId: number;
  projectName: string;
  rateeType: string;
  rateeId: number;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface RankingEntry {
  rateeType: string;
  rateeId: number;
  displayName: string;
  photoUrl: string | null;
  universityName: string | null;
  averageScore: number;
  totalRatings: number;
  minScore: number;
  maxScore: number;
  completedProjects: number;
}

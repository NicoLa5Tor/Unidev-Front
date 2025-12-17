export interface MicrosoftAccessRequestDto {
  email: string;
}

export interface MicrosoftAccessResponseDto {
  status: 'ERROR' | 'INVITED' | 'EXISTS';
  inviteUrl?: string | null;
  message?: string | null;
}

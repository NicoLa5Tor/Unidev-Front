export interface MicrosoftAccessRequestDto {
  email: string;
}

export interface MicrosoftAccessResponseDto {
  status: 'pending' | 'registered';
  message?: string;
}

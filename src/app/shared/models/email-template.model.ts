export interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  subjectTemplate: string;
  htmlTemplate: string;
  active: boolean;
  systemTemplate: boolean;
  availableVariables: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface EmailTemplatePayload {
  code: string;
  name: string;
  subjectTemplate: string;
  htmlTemplate: string;
  active: boolean;
}

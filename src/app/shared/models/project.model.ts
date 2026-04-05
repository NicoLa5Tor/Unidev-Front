export interface CreateProjectDto {
  companyId: number;
  name: string;
  description: string;
  businessObjective: string;
  targetUsers: string;
  mainModules: string;
  integrations?: string | null;
  platforms?: string | null;
  technicalConstraints?: string | null;
  deliveryDeadline?: string | null;
  developmentTypeId?: number | null;
  budgetAmount?: number | null;
}

export interface ProjectDevelopmentTypeOption {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
  displayOrder: number;
}

export interface UpdateProjectRequirementDto {
  title: string;
  description: string | null;
  priority: string | null;
  involvedUser: string | null;
  hasExternalConnection: boolean;
  requiresVisualScreen: boolean;
  devNumber: number;
}

export interface Project {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  businessObjective: string | null;
  targetUsers: string | null;
  mainModules: string | null;
  integrations: string | null;
  platforms: string | null;
  technicalConstraints: string | null;
  deliveryDeadline: string | null;
  developmentTypeId: number | null;
  developmentTypeCode: string | null;
  developmentTypeLabel: string | null;
  budgetAmount: number | null;
  statusCode: string;
  publishedAt: string | null;
  requirementsStatus: string;
  estimationStatus: string;
  requirementsError: string | null;
  estimationError: string | null;
}

export interface ProjectRequirement {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  involvedUser: string | null;
  hasExternalConnection: boolean;
  requiresVisualScreen: boolean;
  devNumber: number | null;
  estimatedHours: number | null;
  reason: string | null;
}

export interface ProjectModule {
  id: number;
  moduleIdentifier: string | null;
  name: string;
  complexity: string | null;
  complexityReason: string | null;
  hoursJuniorDev: number | null;
  requiresExternalIntegration: boolean;
  integrations: string[];
  totalMembers: number | null;
}

export interface ProjectDetail extends Project {
  generalComplexity: string | null;
  totalProjectHours: number | null;
  detectedRisks: string[];
  assumptions: string[];
  teamWarnings: string[];
  requirements: ProjectRequirement[];
  modules: ProjectModule[];
}

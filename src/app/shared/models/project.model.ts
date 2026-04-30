export interface ProjectPublishRequest {
  agreedToSuggestedPrice: boolean;
  customAmount?: number | null;
}

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

export interface ProjectPricingLevelOption {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  active: boolean;
  productivityPercentage?: number | null;
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
  active: boolean;
  devNumber: number;
}

export interface ProjectRequirementAssistantMessageDto {
  message: string;
}

export interface ProjectRequirementAssistantMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface ProjectRequirementAssistantSuggestion {
  title: string | null;
  description: string | null;
  priority: string | null;
  involvedUser: string | null;
  hasExternalConnection: boolean | null;
  requiresVisualScreen: boolean | null;
  devNumber: number | null;
  summary: string | null;
  updatedAt: string | null;
}

export interface ProjectQuote {
  available: boolean;
  currency: string | null;
  baseHours: number | null;
  hourlyRate: number | null;
  baseAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  rangePercentage: number | null;
  calculatedAt: string | null;
  error: string | null;
}

export interface ProjectLevelEstimation {
  levelId: number;
  levelCode: string;
  levelLabel: string;
  productivityPercentage: number | null;
  generalComplexity: string | null;
  totalProjectHours: number | null;
  currency: string | null;
  hourlyRate: number | null;
  baseAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  rangePercentage: number | null;
  calculatedAt: string | null;
  note: string | null;
}

export interface Project {
  id: number;
  companyId: number;
  companyName: string | null;
  companyLogoUrl: string | null;
  companyWebsite: string | null;
  companyDescription: string | null;
  companyOrganizationType: string | null;
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
  quote: ProjectQuote;
  // Precio acordado por la empresa al publicar
  companyAgreedToSuggestedPrice: boolean | null;
  companyPriceCurrency: string | null;
  companyPriceMinAmount: number | null;
  companyPriceMaxAmount: number | null;
  priceSetAt: string | null;
  paymentStatus: 'PENDING_PAYMENT' | 'PAID_HELD' | 'RELEASED' | 'FAILED' | null;
  applicationsCount: number;
  acceptedApplicationsCount: number;
}

export interface ProjectRequirement {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  involvedUser: string | null;
  hasExternalConnection: boolean;
  requiresVisualScreen: boolean;
  active: boolean;
  devNumber: number | null;
  estimatedHours: number | null;
  reason: string | null;
  assistantSuggestion: ProjectRequirementAssistantSuggestion | null;
  assistantMessages: ProjectRequirementAssistantMessage[];
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
  companyTotalProjectsPosted: number | null;
  companyProjectsInDevelopmentCount: number;
  companyCompletedProjectsCount: number;
  generalComplexity: string | null;
  totalProjectHours: number | null;
  detectedRisks: string[];
  assumptions: string[];
  teamWarnings: string[];
  levelEstimations: ProjectLevelEstimation[];
  requirements: ProjectRequirement[];
  modules: ProjectModule[];
  // Precio acordado por la empresa al publicar
  companyAgreedToSuggestedPrice: boolean | null;
  companyPriceCurrency: string | null;
  companyPriceMinAmount: number | null;
  companyPriceMaxAmount: number | null;
  priceSetAt: string | null;
  paymentStatus: 'PENDING_PAYMENT' | 'PAID_HELD' | 'RELEASED' | 'FAILED' | null;
}

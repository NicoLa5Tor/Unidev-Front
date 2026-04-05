export interface CompanyFormModel {
  companyName: string;
  nit: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  domain: string;
  description: string;
  address: string;
}

export interface ProjectCreateFormModel {
  name: string;
  description: string;
  businessObjective: string;
  targetUsers: string;
  mainModules: string;
  integrations: string;
  platforms: string;
  technicalConstraints: string;
  deliveryDeadline: string;
  developmentTypeId: string;
  budgetAmount: string;
}

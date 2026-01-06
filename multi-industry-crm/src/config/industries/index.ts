import blueCollar from './blue_collar.json';
import medical from './medical.json';
import beautyWellness from './beauty_wellness.json';
import mortgage from './mortgage.json';
import insurance from './insurance.json';
import realEstate from './real_estate.json';
import legal from './legal.json';
import accounting from './accounting.json';
import homeServices from './home_services.json';
import automotive from './automotive.json';
import fitness from './fitness.json';
import petServices from './pet_services.json';
import events from './events.json';
import professionalServices from './professional_services.json';
import custom from './custom.json';

export type IndustryType =
  | 'blue_collar'
  | 'medical'
  | 'beauty_wellness'
  | 'mortgage'
  | 'insurance'
  | 'real_estate'
  | 'legal'
  | 'accounting'
  | 'home_services'
  | 'automotive'
  | 'fitness'
  | 'pet_services'
  | 'events'
  | 'professional_services'
  | 'custom';

export interface IndustryTerminology {
  contact: string;
  contacts: string;
  job: string;
  jobs: string;
  complete: string;
}

export interface IndustryFeatures {
  inventory: boolean;
  voice_workflow: boolean;
  appointments: boolean;
  compliance: boolean;
  recurring_billing?: boolean;
  equipment_tracking?: boolean;
  document_tracking?: boolean;
  time_tracking?: boolean;
  membership_tracking?: boolean;
  pet_profiles?: boolean;
  vendor_management?: boolean;
  project_management?: boolean;
}

export interface VoiceParsingConfig {
  time_keywords: string[];
  part_keywords: string[];
  followup_keywords: string[];
}

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  terminology: IndustryTerminology;
  features: IndustryFeatures;
  job_types: string[];
  pipeline_stages: string[];
  billing_types?: string[];
  compliance_requirements?: string[];
  voice_parsing?: VoiceParsingConfig;
  custom_fields?: Record<string, string>;
}

export const industries: Record<IndustryType, IndustryConfig> = {
  blue_collar: blueCollar as IndustryConfig,
  medical: medical as IndustryConfig,
  beauty_wellness: beautyWellness as IndustryConfig,
  mortgage: mortgage as IndustryConfig,
  insurance: insurance as IndustryConfig,
  real_estate: realEstate as IndustryConfig,
  legal: legal as IndustryConfig,
  accounting: accounting as IndustryConfig,
  home_services: homeServices as IndustryConfig,
  automotive: automotive as IndustryConfig,
  fitness: fitness as IndustryConfig,
  pet_services: petServices as IndustryConfig,
  events: events as IndustryConfig,
  professional_services: professionalServices as IndustryConfig,
  custom: custom as IndustryConfig,
};

export const getIndustryConfig = (industryId: IndustryType): IndustryConfig => {
  return industries[industryId] || industries.custom;
};

export const getAllIndustries = (): IndustryConfig[] => {
  return Object.values(industries);
};

export default industries;

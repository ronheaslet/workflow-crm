import { useMemo } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { getIndustryConfig } from '../config/industries';
import type { IndustryConfig, IndustryType } from '../config/industries';

export function useIndustryConfig() {
  const { tenant } = useTenant();

  const config: IndustryConfig = useMemo(() => {
    const industryId = (tenant?.industry as IndustryType) || 'custom';
    return getIndustryConfig(industryId);
  }, [tenant?.industry]);

  // Terminology helper
  const t = (key: keyof IndustryConfig['terminology']) => {
    return config.terminology[key] || key;
  };

  // Feature check
  const hasFeature = (feature: keyof IndustryConfig['features']) => {
    return config.features[feature] === true;
  };

  // Get pipeline stages
  const getPipelineStages = () => {
    return config.pipeline_stages || [];
  };

  // Get job types
  const getJobTypes = () => {
    return config.job_types || [];
  };

  // Get billing types
  const getBillingTypes = () => {
    return config.billing_types || [];
  };

  // Get voice parsing config
  const getVoiceParsingConfig = () => {
    return config.voice_parsing || null;
  };

  // Get custom fields definition
  const getCustomFields = () => {
    return config.custom_fields || {};
  };

  // Get compliance requirements
  const getComplianceRequirements = () => {
    return config.compliance_requirements || [];
  };

  // Partner types based on industry
  const getPartnerTypes = () => {
    const industryPartnerTypes: Record<string, string[]> = {
      mortgage: ['realtor', 'title_company', 'appraiser', 'insurance_agent', 'financial_planner'],
      insurance: ['referral_partner', 'agency', 'carrier_rep', 'adjuster'],
      real_estate: ['lender', 'title_company', 'inspector', 'contractor', 'stager'],
      legal: ['co_counsel', 'expert_witness', 'court_reporter', 'investigator'],
      accounting: ['attorney', 'financial_advisor', 'banker', 'insurance_agent'],
      blue_collar: ['supplier', 'subcontractor', 'equipment_vendor', 'referral_partner'],
      home_services: ['supplier', 'subcontractor', 'equipment_vendor', 'referral_partner'],
      automotive: ['parts_supplier', 'tow_service', 'body_shop', 'dealer'],
      medical: ['specialist', 'lab', 'pharmacy', 'insurance_rep'],
      beauty_wellness: ['product_vendor', 'educator', 'influencer', 'referral_partner'],
      fitness: ['nutritionist', 'physical_therapist', 'supplement_vendor', 'influencer'],
      pet_services: ['vet', 'pet_store', 'rescue_organization', 'trainer'],
      events: ['venue', 'caterer', 'photographer', 'florist', 'dj_band'],
      professional_services: ['referral_partner', 'technology_vendor', 'consultant', 'contractor'],
    };

    return industryPartnerTypes[config.id] || ['referral_partner', 'vendor', 'contractor'];
  };

  // Partner tiers
  const getPartnerTiers = () => {
    const industryTiers: Record<string, string[]> = {
      mortgage: ['prospect', 'top50', 'account', 'channel'],
      real_estate: ['prospect', 'preferred', 'exclusive'],
      default: ['prospect', 'active', 'preferred', 'strategic'],
    };

    return industryTiers[config.id] || industryTiers.default;
  };

  return {
    config,
    t,
    hasFeature,
    getPipelineStages,
    getJobTypes,
    getBillingTypes,
    getVoiceParsingConfig,
    getCustomFields,
    getComplianceRequirements,
    getPartnerTypes,
    getPartnerTiers,
  };
}

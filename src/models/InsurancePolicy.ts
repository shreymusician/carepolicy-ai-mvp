import { Schema, model, Document, Types } from 'mongoose';

export interface ISumInsuredRange {
  label: string;
  min_lakhs?: number;
  max_lakhs?: number;
}

export interface IPremiumRange {
  label?: string;
  min?: number;
  max?: number;
  currency?: string;
  is_approximate?: boolean;
}

export interface IInsurancePolicy extends Document {
  company_id: Types.ObjectId;
  company_name: string;
  company_logo_url: string;
  policy_name: string;
  policy_type: string;
  description: string;
  coverage_summary: string;
  waiting_period: string;
  sum_insured_range: ISumInsuredRange;
  premium_range?: IPremiumRange;
  target_audience: string[];
  key_benefits: string[];
  key_exclusions: string[];
  official_website?: string;
  is_active: boolean;
  data_is_approximate: boolean;
  tags?: string[];
  created_at: Date;
  updated_at?: Date;
}

const sumInsuredRangeSchema = new Schema<ISumInsuredRange>(
  {
    label: { type: String, required: true },
    min_lakhs: { type: Number },
    max_lakhs: { type: Number }
  },
  { _id: false }
);

const premiumRangeSchema = new Schema<IPremiumRange>(
  {
    label: { type: String },
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
    is_approximate: { type: Boolean, default: true }
  },
  { _id: false }
);

const insurancePolicySchema = new Schema<IInsurancePolicy>(
  {
    company_id: { type: Schema.Types.ObjectId, ref: 'InsuranceCompany', required: true, index: true },
    company_name: { type: String, required: true, index: true },
    company_logo_url: { type: String, required: true },
    policy_name: { type: String, required: true },
    policy_type: { type: String, required: true, index: true },
    description: { type: String, required: true },
    coverage_summary: { type: String, required: true },
    waiting_period: { type: String, required: true },
    sum_insured_range: { type: sumInsuredRangeSchema, required: true },
    premium_range: { type: premiumRangeSchema },
    target_audience: { type: [String], required: true, index: true },
    key_benefits: { type: [String], default: [] },
    key_exclusions: { type: [String], default: [] },
    official_website: { type: String },
    is_active: { type: Boolean, default: true, required: true, index: true },
    data_is_approximate: { type: Boolean, default: true, required: true },
    tags: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now, required: true },
    updated_at: { type: Date }
  },
  { collection: 'insurance_policies', timestamps: false }
);

insurancePolicySchema.index({ policy_name: 'text', description: 'text', coverage_summary: 'text', company_name: 'text' });
insurancePolicySchema.index({ policy_type: 1, target_audience: 1 });

export default model<IInsurancePolicy>('InsurancePolicy', insurancePolicySchema);

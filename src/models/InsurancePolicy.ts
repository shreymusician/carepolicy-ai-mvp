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

export type VerificationStatus = 'verified' | 'unverified';
export type SourceType = 'IRDAI' | 'INSURER';
export type ProductStatus = 'active' | 'withdrawn' | 'unknown';

export interface IInsurancePolicy extends Document {
  company_id?: Types.ObjectId;
  company_name: string;
  company_logo_url?: string;
  policy_name: string;
  policy_type: string;
  description?: string;
  coverage_summary?: string;
  waiting_period?: string;
  eligibility?: string;
  sum_insured_range?: ISumInsuredRange;
  premium_range?: IPremiumRange;
  target_audience: string[];
  key_benefits: string[];
  key_exclusions: string[];

  // IRDAI provenance
  uin?: string;
  irdai_approval_date?: Date;
  product_status: ProductStatus;
  customer_information_sheet_url?: string;
  official_policy_pdf_url?: string;
  official_website?: string;
  source_url?: string;
  source_type?: SourceType;
  source_fetched_at?: Date;
  last_verified_at?: Date;
  verification_status: VerificationStatus;

  is_active: boolean;
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
    company_id: { type: Schema.Types.ObjectId, ref: 'InsuranceCompany', index: true },
    company_name: { type: String, required: true, index: true },
    company_logo_url: { type: String },
    policy_name: { type: String, required: true },
    policy_type: { type: String, required: true, index: true },
    description: { type: String },
    coverage_summary: { type: String },
    waiting_period: { type: String },
    eligibility: { type: String },
    sum_insured_range: { type: sumInsuredRangeSchema },
    premium_range: { type: premiumRangeSchema },
    target_audience: { type: [String], default: [], index: true },
    key_benefits: { type: [String], default: [] },
    key_exclusions: { type: [String], default: [] },
    uin: { type: String, index: true, sparse: true, unique: true },
    irdai_approval_date: { type: Date },
    product_status: {
      type: String,
      enum: ['active', 'withdrawn', 'unknown'],
      default: 'unknown',
      required: true,
      index: true
    },
    customer_information_sheet_url: { type: String },
    official_website: { type: String },
    official_policy_pdf_url: { type: String },
    source_url: { type: String },
    source_type: { type: String, enum: ['IRDAI', 'INSURER'], index: true },
    source_fetched_at: { type: Date },
    last_verified_at: { type: Date },
    verification_status: {
      type: String,
      enum: ['verified', 'unverified'],
      default: 'unverified',
      required: true,
      index: true
    },
    is_active: { type: Boolean, default: true, required: true, index: true },
    tags: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now, required: true },
    updated_at: { type: Date }
  },
  { collection: 'insurance_policies', timestamps: false }
);

insurancePolicySchema.index({ policy_name: 'text', description: 'text', coverage_summary: 'text', company_name: 'text' });
insurancePolicySchema.index({ policy_type: 1, target_audience: 1 });

export default model<IInsurancePolicy>('InsurancePolicy', insurancePolicySchema);

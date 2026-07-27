import { Schema, model, Document } from 'mongoose';

export interface IInsuranceCompany extends Document {
  name: string;
  slug: string;
  logo_url: string;
  official_website?: string;
  is_active: boolean;
  created_at: Date;
}

const insuranceCompanySchema = new Schema<IInsuranceCompany>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo_url: { type: String, required: true },
    official_website: { type: String },
    is_active: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now, required: true }
  },
  { collection: 'insurance_companies', timestamps: false }
);

insuranceCompanySchema.index({ is_active: 1 });

export default model<IInsuranceCompany>('InsuranceCompany', insuranceCompanySchema);

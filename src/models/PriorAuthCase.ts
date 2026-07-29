import { Schema, model, Document, Types } from 'mongoose';

export type CaseStatus =
  | 'insurance_selection'
  | 'policy_review'
  | 'medical_records'
  | 'prior_authorization'
  | 'ready_for_review';

export const CASE_STATUS_ORDER: CaseStatus[] = [
  'insurance_selection',
  'policy_review',
  'medical_records',
  'prior_authorization',
  'ready_for_review'
];

export type DocumentCategory = 'discharge_summary' | 'medical_reports' | 'lab_reports' | 'bills' | 'prescriptions';

export interface ICaseInsuranceSelection {
  company_id?: Types.ObjectId;
  company_name: string;
  policy_id: Types.ObjectId;
  policy_name: string;
  policy_type: string;
  confirmed_at: Date;
}

export interface ICaseMedicalDocument {
  id: string;
  category: DocumentCategory;
  filename: string;
  size: number;
  mimetype: string;
  uploaded_at: Date;
}

export interface IPriorAuthCase extends Document {
  coordinator_id: Types.ObjectId;
  patient_name: string;
  status: CaseStatus;

  insurance_selection?: ICaseInsuranceSelection;
  policy_review_confirmed_at?: Date;
  medical_documents: ICaseMedicalDocument[];
  medical_records_confirmed_at?: Date;
  prior_authorization_generated_at?: Date;

  created_at: Date;
  updated_at: Date;
}

const caseInsuranceSelectionSchema = new Schema<ICaseInsuranceSelection>(
  {
    company_id: { type: Schema.Types.ObjectId, ref: 'InsuranceCompany' },
    company_name: { type: String, required: true },
    policy_id: { type: Schema.Types.ObjectId, ref: 'InsurancePolicy', required: true },
    policy_name: { type: String, required: true },
    policy_type: { type: String, required: true },
    confirmed_at: { type: Date, required: true }
  },
  { _id: false }
);

const caseMedicalDocumentSchema = new Schema<ICaseMedicalDocument>(
  {
    id: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['discharge_summary', 'medical_reports', 'lab_reports', 'bills', 'prescriptions']
    },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploaded_at: { type: Date, required: true }
  },
  { _id: false }
);

const priorAuthCaseSchema = new Schema<IPriorAuthCase>(
  {
    coordinator_id: { type: Schema.Types.ObjectId, ref: 'InsuranceCoordinator', required: true, index: true },
    patient_name: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      default: 'insurance_selection',
      enum: CASE_STATUS_ORDER
    },

    insurance_selection: { type: caseInsuranceSelectionSchema },
    policy_review_confirmed_at: { type: Date },
    medical_documents: { type: [caseMedicalDocumentSchema], default: [] },
    medical_records_confirmed_at: { type: Date },
    prior_authorization_generated_at: { type: Date }
  },
  {
    collection: 'prior_auth_cases',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

priorAuthCaseSchema.index({ coordinator_id: 1, created_at: -1 });

export default model<IPriorAuthCase>('PriorAuthCase', priorAuthCaseSchema);

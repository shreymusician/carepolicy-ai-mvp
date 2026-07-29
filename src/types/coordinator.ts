import { CaseStatus, DocumentCategory } from '../models/PriorAuthCase';

export interface CreateCaseRequest {
  patient_name: string;
}

export interface SelectInsuranceRequest {
  policy_id: string;
}

export interface CaseSummary {
  id: string;
  patient_name: string;
  status: CaseStatus;
  insurance_selection?: {
    policy_id: string;
    company_name: string;
    policy_name: string;
    policy_type: string;
  };
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface CaseDetail extends CaseSummary {
  medical_documents: Array<{
    id: string;
    category: DocumentCategory;
    filename: string;
    size: number;
    mimetype: string;
    uploaded_at: string;
  }>;
  policy_review_confirmed_at?: string;
  medical_records_confirmed_at?: string;
  prior_authorization_generated_at?: string;
}

export class CaseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaseValidationError';
  }
}

export class CaseStepOrderError extends Error {
  constructor(message = 'This step is not available yet. Please complete the previous steps first.') {
    super(message);
    this.name = 'CaseStepOrderError';
  }
}

export class CaseNotFoundError extends Error {
  constructor() {
    super('This case could not be found.');
    this.name = 'CaseNotFoundError';
  }
}

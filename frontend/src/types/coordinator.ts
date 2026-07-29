export type CaseStatus =
  | 'insurance_selection'
  | 'policy_review'
  | 'medical_records'
  | 'prior_authorization'
  | 'ready_for_review'

export const CASE_STATUS_ORDER: CaseStatus[] = [
  'insurance_selection',
  'policy_review',
  'medical_records',
  'prior_authorization',
  'ready_for_review'
]

export type DocumentCategory = 'discharge_summary' | 'medical_reports' | 'lab_reports' | 'bills' | 'prescriptions'

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'medical_reports', label: 'Medical Reports' },
  { value: 'lab_reports', label: 'Lab Reports' },
  { value: 'bills', label: 'Bills' },
  { value: 'prescriptions', label: 'Prescriptions' }
]

export interface CaseInsuranceSelectionSummary {
  policy_id: string
  company_name: string
  policy_name: string
  policy_type: string
}

export interface CaseMedicalDocument {
  id: string
  category: DocumentCategory
  filename: string
  size: number
  mimetype: string
  uploaded_at: string
}

export interface CaseSummary {
  id: string
  patient_name: string
  status: CaseStatus
  insurance_selection?: CaseInsuranceSelectionSummary
  document_count: number
  created_at: string
  updated_at: string
}

export interface CaseDetail extends CaseSummary {
  medical_documents: CaseMedicalDocument[]
  policy_review_confirmed_at?: string
  medical_records_confirmed_at?: string
  prior_authorization_generated_at?: string
}

export interface InsuranceCompany {
  _id: string
  name: string
  logo_url: string
}

export interface InsurancePolicy {
  _id: string
  company_name: string
  company_logo_url: string
  policy_name: string
  policy_type: string
  description?: string
  coverage_summary?: string
  waiting_period?: string
  eligibility?: string
  sum_insured_range?: { label: string }
  target_audience: string[]
  key_benefits: string[]
  key_exclusions: string[]
  verification_status: 'verified' | 'unverified'
  official_policy_pdf_url?: string
}

export const POLICY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'family_floater', label: 'Family Floater' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'top_up', label: 'Top-Up' },
  { value: 'critical_illness', label: 'Critical Illness' }
]

export const TARGET_AUDIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'family', label: 'Family' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'child', label: 'Child' }
]

export interface KnowledgeField {
  value: string | null
  source: string | null
  confidence: number | null
  page_number: number | null
}

export interface ClaimKnowledge {
  required_documents: string[]
  common_rejection_reasons: string[]
  mandatory_signatures: string[]
  hospital_requirements: string[]
  document_checklist: string[]
}

export interface PolicyKnowledge {
  facts: Record<string, KnowledgeField>
  claim_knowledge: ClaimKnowledge
  extraction_status: 'pending' | 'success' | 'partial' | 'failed'
}

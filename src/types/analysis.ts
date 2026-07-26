export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldValue {
  value: string | null;
  confidence: ConfidenceLevel;
  source: string;
}

export interface Exclusion {
  exclusion: string;
  details: string;
  confidence: ConfidenceLevel;
}

export interface PolicySummary {
  what_is_covered: string;
  what_is_not_covered: string;
  key_points: string[];
  source: string;
}

export interface RelevantClause {
  clause_name: string;
  reason_relevant: string;
  clause_details: string;
  appears_applicable: boolean;
  confidence: ConfidenceLevel;
  source: string;
}

export interface Issue {
  severity: 'critical' | 'important' | 'info';
  issue: string;
  explanation: string;
  action_required?: string;
  confidence?: ConfidenceLevel;
}

export interface TreatmentSummary {
  treatment: string;
  diagnosis: string;
  appears_covered: string;
  coverage_explanation: string;
  potential_financial_responsibility: string;
  important_treatment_notes: string[];
  source: string;
}

export interface ExtractedFacts {
  policy_information: {
    [key: string]: FieldValue;
  };
  exclusions: Exclusion[];
}

export interface AiGeneratedKnowledge {
  policy_summary: PolicySummary;
  relevant_clauses: RelevantClause[];
}

export interface RiskAssessment {
  critical_issues: Issue[];
  important_notes: Issue[];
  general_notes: Issue[];
}

export interface Metadata {
  prescription_provided: boolean;
  overall_confidence: ConfidenceLevel;
  confidence_explanation: string;
  processing_complete: boolean;
  processing_time_ms: number;
  document_quality: string;
  ocr_confidence: ConfidenceLevel;
}

export interface DocumentAnalysis {
  extracted_facts: ExtractedFacts;
  ai_generated_knowledge: AiGeneratedKnowledge;
  risk_assessment: RiskAssessment;
  treatment_specific_summary?: TreatmentSummary;
  metadata: Metadata;
}

export interface AnalysisResult {
  document_analysis: DocumentAnalysis;
}

export interface SaveAnalysisInput {
  policy_filename: string;
  policy_upload_size: number;
  policy_mime_type: string;
  prescription_provided: boolean;
  prescription_filename?: string;
  prescription_upload_size?: number;
  prescription_mime_type?: string;
  analysis_result: AnalysisResult;
  processing_time_ms: number;
  ocr_confidence: ConfidenceLevel;
  overall_confidence: ConfidenceLevel;
  extraction_method: ExtractionMethod;
  processing_status: ProcessingStatus;
  error_message?: string;
}

export type ProcessingStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';
export type ExtractionMethod = 'DIGITAL_PDF' | 'SCANNED_PDF' | 'IMAGE_OCR' | 'IMAGE_DIRECT';

export interface ExtractionMetadata {
  method: ExtractionMethod;
  confidence: ConfidenceLevel;
  pages?: number;
  ocrApplied: boolean;
}

export interface ProcessingMetadata {
  status: ProcessingStatus;
  startedAt: Date;
  completedAt?: Date;
  durationMs: number;
  extractionMethod?: ExtractionMethod;
  errorMessage?: string;
}

export class OcrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OcrError';
  }
}

export class DocumentCleanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentCleanError';
  }
}

export class PromptBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptBuildError';
  }
}

export class LlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

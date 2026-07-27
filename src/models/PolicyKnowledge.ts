import { Schema, model, Document, Types } from 'mongoose';

/**
 * A single extracted fact with full provenance so any value shown in the UI can be
 * traced back to the exact place in the official document it came from.
 */
export interface IKnowledgeField {
  value: string | null;
  source: string | null;
  confidence: number | null;
  page_number: number | null;
}

export const KNOWLEDGE_TOPICS = [
  'coverage',
  'exclusions',
  'waiting_periods',
  'pre_existing_disease_rules',
  'hospitalization',
  'room_rent_limits',
  'icu_limits',
  'day_care_procedures',
  'maternity',
  'newborn_cover',
  'mental_health',
  'ayush',
  'organ_donor',
  'ambulance',
  'health_checkup',
  'no_claim_bonus',
  'co_payment',
  'sub_limits',
  'restoration_benefits',
  'eligibility',
  'entry_age',
  'renewability',
  'tax_benefits',
  'documents_required',
  'claim_submission_rules',
  'network_hospital_requirements',
  'cashless_eligibility'
] as const;

export type KnowledgeTopic = (typeof KNOWLEDGE_TOPICS)[number];

export interface IFaq {
  question: string;
  answer: string;
  confidence: number | null;
  page_number: number | null;
}

export interface IClaimKnowledge {
  required_documents: string[];
  common_rejection_reasons: string[];
  mandatory_signatures: string[];
  hospital_requirements: string[];
  document_checklist: string[];
}

export type ExtractionStatus = 'pending' | 'success' | 'partial' | 'failed';

export interface IPolicyKnowledge extends Document {
  policy_id: Types.ObjectId;
  /** Present only for IRDAI-catalogued products. Never synthesised. */
  uin?: string;

  facts: Record<string, IKnowledgeField>;

  citizen_summary?: string;
  worker_summary?: string;
  faqs: IFaq[];
  claim_knowledge: IClaimKnowledge;

  // Powers disease/treatment/benefit search without a vector store.
  searchable_terms: string[];

  // Reserved for the Network Hospitals module — intentionally empty for now.
  network_hospitals: unknown[];
  cashless_available?: boolean | null;
  hospital_locations: unknown[];

  // Versioning / change detection
  source_document_url?: string;
  document_hash?: string;
  document_page_count?: number;
  knowledge_version: number;
  extraction_status: ExtractionStatus;
  extraction_error?: string;
  last_ai_extraction_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

const knowledgeFieldSchema = new Schema<IKnowledgeField>(
  {
    value: { type: String, default: null },
    source: { type: String, default: null },
    confidence: { type: Number, default: null, min: 0, max: 100 },
    page_number: { type: Number, default: null }
  },
  { _id: false }
);

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    confidence: { type: Number, default: null, min: 0, max: 100 },
    page_number: { type: Number, default: null }
  },
  { _id: false }
);

const claimKnowledgeSchema = new Schema<IClaimKnowledge>(
  {
    required_documents: { type: [String], default: [] },
    common_rejection_reasons: { type: [String], default: [] },
    mandatory_signatures: { type: [String], default: [] },
    hospital_requirements: { type: [String], default: [] },
    document_checklist: { type: [String], default: [] }
  },
  { _id: false }
);

const policyKnowledgeSchema = new Schema<IPolicyKnowledge>(
  {
    policy_id: { type: Schema.Types.ObjectId, ref: 'InsurancePolicy', required: true, unique: true, index: true },
    uin: { type: String, index: true, sparse: true },

    facts: {
      type: Map,
      of: knowledgeFieldSchema,
      default: {}
    },

    citizen_summary: { type: String },
    worker_summary: { type: String },
    faqs: { type: [faqSchema], default: [] },
    claim_knowledge: { type: claimKnowledgeSchema, default: () => ({}) },

    searchable_terms: { type: [String], default: [], index: true },

    network_hospitals: { type: [Schema.Types.Mixed], default: [] },
    cashless_available: { type: Boolean, default: null },
    hospital_locations: { type: [Schema.Types.Mixed], default: [] },

    source_document_url: { type: String },
    document_hash: { type: String, index: true },
    document_page_count: { type: Number },
    knowledge_version: { type: Number, default: 1, required: true },
    extraction_status: {
      type: String,
      enum: ['pending', 'success', 'partial', 'failed'],
      default: 'pending',
      required: true,
      index: true
    },
    extraction_error: { type: String },
    last_ai_extraction_at: { type: Date },
    created_at: { type: Date, default: Date.now, required: true },
    updated_at: { type: Date }
  },
  { collection: 'policy_knowledge', timestamps: false }
);

policyKnowledgeSchema.index({
  searchable_terms: 'text',
  citizen_summary: 'text',
  worker_summary: 'text'
});

export default model<IPolicyKnowledge>('PolicyKnowledge', policyKnowledgeSchema);

import { Schema, model, Document } from 'mongoose';
import { AnalysisResult } from '../types/analysis';

export interface IAnalysis extends Document {
  // Current fields
  created_at: Date;
  policy_filename: string;
  policy_upload_size: number;
  policy_mime_type: string;
  prescription_provided: boolean;
  prescription_filename?: string;
  prescription_upload_size?: number;
  prescription_mime_type?: string;
  analysis_result: AnalysisResult;
  processing_time_ms: number;
  ocr_confidence: 'high' | 'medium' | 'low';
  overall_confidence: 'high' | 'medium' | 'low';
  extraction_method: 'DIGITAL_PDF' | 'SCANNED_PDF' | 'IMAGE_OCR' | 'IMAGE_DIRECT';
  processing_status: 'PROCESSING' | 'SUCCESS' | 'FAILED';
  error_message?: string;
  patient_summary_pdf_generated: boolean;
  patient_summary_text?: string;

  // Future-proofing fields (for phase 2+)
  hospital_id?: string;           // For multi-tenancy (Phase 3)
  user_id?: string;               // For audit trails (Phase 2)
  updated_at?: Date;              // For change tracking
  data_version?: number;          // For schema migrations
  tags?: string[];                // For categorization
  created_by?: string;            // Audit trail
  updated_by?: string;            // Audit trail
  trace_id?: string;              // For debugging
}

const analysisSchema = new Schema<IAnalysis>(
  {
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    policy_filename: {
      type: String,
      required: true
    },
    policy_upload_size: {
      type: Number,
      required: true
    },
    policy_mime_type: {
      type: String,
      required: true
    },
    prescription_provided: {
      type: Boolean,
      default: false,
      required: true
    },
    prescription_filename: {
      type: String,
      sparse: true
    },
    prescription_upload_size: {
      type: Number,
      sparse: true
    },
    prescription_mime_type: {
      type: String,
      sparse: true
    },
    analysis_result: {
      type: Schema.Types.Mixed,
      required: true
    },
    processing_time_ms: {
      type: Number,
      required: true
    },
    ocr_confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true
    },
    overall_confidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true
    },
    extraction_method: {
      type: String,
      enum: ['DIGITAL_PDF', 'SCANNED_PDF', 'IMAGE_OCR', 'IMAGE_DIRECT'],
      required: true
    },
    processing_status: {
      type: String,
      enum: ['PROCESSING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS',
      required: true
    },
    error_message: {
      type: String,
      sparse: true
    },
    patient_summary_pdf_generated: {
      type: Boolean,
      default: false,
      required: true
    },
    patient_summary_text: {
      type: String,
      sparse: true
    },

    // Future-proofing fields
    hospital_id: {
      type: String,
      sparse: true,
      index: true
    },
    user_id: {
      type: String,
      sparse: true,
      index: true
    },
    updated_at: {
      type: Date,
      sparse: true
    },
    data_version: {
      type: Number,
      default: 1
    },
    tags: {
      type: [String],
      sparse: true
    },
    created_by: {
      type: String,
      sparse: true
    },
    updated_by: {
      type: String,
      sparse: true
    },
    trace_id: {
      type: String,
      sparse: true,
      index: true
    }
  },
  {
    collection: 'analyses',
    timestamps: false
  }
);

// Indexes for current queries
analysisSchema.index({ created_at: -1 });
analysisSchema.index({ prescription_provided: 1 });

// Indexes for future queries
analysisSchema.index({ hospital_id: 1, created_at: -1 });  // Multi-tenancy queries
analysisSchema.index({ processing_status: 1 });             // Status tracking
analysisSchema.index({ trace_id: 1 });                      // Debugging

export default model<IAnalysis>('Analysis', analysisSchema);

import { AnalysisResult, ExtractionMethod } from './analysis';

/**
 * HTTP Request contracts for API endpoints
 */

export interface AnalyzeRequest {
  policy: Buffer;          // Insurance policy file (PDF)
  prescription?: Buffer;   // Optional doctor prescription (PDF/Image)
}

/**
 * HTTP Response contracts for API endpoints
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  trace_id: string;
  timestamp: string;
}

export interface AnalyzeResponse {
  document_id: string;
  analysis_result: AnalysisResult;
  metadata: {
    processing_time_ms: number;
    prescription_provided: boolean;
    extraction_method: ExtractionMethod;
    ocr_confidence: 'high' | 'medium' | 'low';
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  version: string;
  uptime_seconds?: number;
  dependencies?: {
    mongodb: 'healthy' | 'unhealthy';
    gemini_api: 'healthy' | 'unhealthy';
  };
}

/**
 * Error Response
 */

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  trace_id: string;
  timestamp: string;
}

/**
 * Validation helpers
 */

export class ApiValidation {
  static validateAnalyzeRequest(req: AnalyzeRequest): string[] {
    const errors: string[] = [];

    if (!req.policy) {
      errors.push('policy file is required');
    } else if (!Buffer.isBuffer(req.policy)) {
      errors.push('policy must be a file buffer');
    }

    if (req.prescription && !Buffer.isBuffer(req.prescription)) {
      errors.push('prescription must be a file buffer');
    }

    return errors;
  }
}

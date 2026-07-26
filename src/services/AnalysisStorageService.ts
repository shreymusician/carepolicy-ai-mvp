import Analysis, { IAnalysis } from '../models/Analysis';
import { SaveAnalysisInput, StorageError, NotFoundError } from '../types/analysis';

export class AnalysisStorageService {
  async saveAnalysis(data: SaveAnalysisInput): Promise<string> {
    try {
      // Validate required fields
      if (!data.policy_filename || !data.analysis_result) {
        throw new StorageError('Missing required fields: policy_filename, analysis_result');
      }

      if (!data.extraction_method || !data.processing_status) {
        throw new StorageError('Missing required fields: extraction_method, processing_status');
      }

      console.log(`[AnalysisStorage] Saving analysis for: ${data.policy_filename}`);
      console.log(`[AnalysisStorage] Extraction method: ${data.extraction_method}`);
      console.log(`[AnalysisStorage] Processing status: ${data.processing_status}`);

      const document = new Analysis({
        created_at: new Date(),
        policy_filename: data.policy_filename,
        policy_upload_size: data.policy_upload_size,
        policy_mime_type: data.policy_mime_type,
        prescription_provided: data.prescription_provided,
        prescription_filename: data.prescription_filename,
        prescription_upload_size: data.prescription_upload_size,
        prescription_mime_type: data.prescription_mime_type,
        analysis_result: data.analysis_result,
        processing_time_ms: data.processing_time_ms,
        ocr_confidence: data.ocr_confidence,
        overall_confidence: data.overall_confidence,
        extraction_method: data.extraction_method,
        processing_status: data.processing_status,
        error_message: data.error_message,
        patient_summary_pdf_generated: false
      });

      // Validate document before saving
      const errors = document.validateSync();
      if (errors) {
        const errorMessages = Object.keys(errors).join(', ');
        throw new StorageError(`Validation failed: ${errorMessages}`);
      }

      const saved = await document.save();

      console.log(`[AnalysisStorage] Document saved with ID: ${saved._id}`);
      console.log(`[AnalysisStorage] Processing time: ${data.processing_time_ms}ms`);

      return saved._id.toString();
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to save analysis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getAnalysis(documentId: string): Promise<IAnalysis> {
    try {
      if (!documentId || typeof documentId !== 'string') {
        throw new NotFoundError('Document ID is required and must be a string');
      }

      console.log(`[AnalysisStorage] Retrieving analysis: ${documentId}`);

      const analysis = await Analysis.findById(documentId);

      if (!analysis) {
        throw new NotFoundError(`Analysis not found: ${documentId}`);
      }

      console.log(`[AnalysisStorage] Document retrieved successfully`);
      return analysis;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new StorageError(
        `Failed to retrieve analysis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async updatePatientSummaryPdf(documentId: string, patientSummaryText: string): Promise<void> {
    try {
      if (!documentId || typeof documentId !== 'string') {
        throw new NotFoundError('Document ID is required');
      }

      if (!patientSummaryText || typeof patientSummaryText !== 'string') {
        throw new StorageError('Patient summary text is required and must be a string');
      }

      console.log(`[AnalysisStorage] Updating PDF for document: ${documentId}`);

      const result = await Analysis.updateOne(
        { _id: documentId },
        {
          patient_summary_pdf_generated: true,
          patient_summary_text: patientSummaryText
        }
      );

      if (result.matchedCount === 0) {
        throw new NotFoundError(`Analysis not found: ${documentId}`);
      }

      console.log(`[AnalysisStorage] PDF metadata updated successfully`);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to update analysis: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async updateProcessingStatus(
    documentId: string,
    status: 'PROCESSING' | 'SUCCESS' | 'FAILED',
    errorMessage?: string
  ): Promise<void> {
    try {
      if (!documentId || typeof documentId !== 'string') {
        throw new NotFoundError('Document ID is required');
      }

      console.log(`[AnalysisStorage] Updating status to: ${status}`);

      const updateData: Record<string, unknown> = { processing_status: status };
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const result = await Analysis.updateOne({ _id: documentId }, updateData);

      if (result.matchedCount === 0) {
        throw new NotFoundError(`Analysis not found: ${documentId}`);
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to update processing status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default new AnalysisStorageService();

import { Request, Response, NextFunction } from 'express';
import OcrService from '../services/OcrService';
import DocumentCleanerService from '../services/DocumentCleanerService';
import PromptBuilderService from '../services/PromptBuilderService';
import LlmService from '../services/LlmService';
import ResponseParserService from '../services/ResponseParserService';
import AnalysisStorageService from '../services/AnalysisStorageService';
import { isValidPdfBuffer } from '../utils/validation';
import { OcrError } from '../types/analysis';

export class AnalysisController {
  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    let documentId: string | null = null;

    try {
      // Validate files exist
      if (!req.files || typeof req.files !== 'object') {
        throw new OcrError('No files provided');
      }

      const files = req.files as Record<string, Express.Multer.File[] | Express.Multer.File>;

      // Get policy file (required)
      const policyFileArray = Array.isArray(files.policy) ? files.policy : [files.policy];
      const policyFile = policyFileArray?.[0];

      if (!policyFile) {
        throw new OcrError('Insurance policy PDF is required');
      }

      if (!isValidPdfBuffer(policyFile.buffer)) {
        throw new OcrError('Policy file must be a valid PDF');
      }

      // Get prescription file (optional)
      const prescriptionFileArray = Array.isArray(files.prescription)
        ? files.prescription
        : [files.prescription];
      const prescriptionFile = prescriptionFileArray?.[0] || null;

      if (prescriptionFile && !isValidPdfBuffer(prescriptionFile.buffer)) {
        throw new OcrError('Prescription file must be a valid PDF or image');
      }

      // Track processing time
      const startTime = Date.now();

      console.log(`[Analysis] Starting analysis pipeline for: ${policyFile.originalname}`);
      console.log(`[Analysis] Policy size: ${policyFile.size} bytes`);
      console.log(`[Analysis] Prescription provided: ${!!prescriptionFile}`);

      // Step 1: Extract text from policy with method tracking
      console.log('[Analysis] Step 1: Extracting text from policy...');
      const policyOcrResult = await OcrService.extractTextFromPdf(policyFile.buffer);
      const rawPolicyText = policyOcrResult.text;
      const extractionMethod = policyOcrResult.method;

      console.log(`[Analysis] Extraction method: ${extractionMethod}`);
      console.log(`[Analysis] Extracted text length: ${rawPolicyText.length} characters`);

      // Step 2: Clean policy text
      console.log('[Analysis] Step 2: Cleaning policy text...');
      const cleanPolicyText = DocumentCleanerService.clean(rawPolicyText);
      console.log(`[Analysis] Cleaned text length: ${cleanPolicyText.length} characters`);

      // Step 3: Extract and clean prescription text (if provided)
      let cleanPrescriptionText: string | undefined;
      if (prescriptionFile) {
        console.log('[Analysis] Step 3a: Extracting text from prescription...');
        const prescriptionOcrResult = await OcrService.extractTextFromImage(
          prescriptionFile.buffer,
          prescriptionFile.mimetype
        );
        const rawPrescriptionText = prescriptionOcrResult.text;
        console.log(`[Analysis] Prescription extraction method: ${prescriptionOcrResult.method}`);
        console.log(`[Analysis] Extracted prescription length: ${rawPrescriptionText.length} characters`);

        console.log('[Analysis] Step 3b: Cleaning prescription text...');
        cleanPrescriptionText = DocumentCleanerService.clean(rawPrescriptionText);
        console.log(`[Analysis] Cleaned prescription length: ${cleanPrescriptionText.length} characters`);
      } else {
        console.log('[Analysis] Step 3: Skipping prescription (not provided)');
      }

      // Step 4: Build AI prompt
      console.log('[Analysis] Step 4: Building AI prompt...');
      const prompt = PromptBuilderService.buildAnalysisPrompt(
        cleanPolicyText,
        cleanPrescriptionText
      );
      console.log(`[Analysis] Prompt length: ${prompt.length} characters`);

      // Step 5: Call AI provider (Gemini)
      console.log('[Analysis] Step 5: Calling AI provider...');
      const llmResponse = await LlmService.analyze(prompt);
      console.log(`[Analysis] AI response received: ${llmResponse.length} characters`);

      // Step 6: Parse and validate response
      console.log('[Analysis] Step 6: Parsing and validating response...');
      const analysisResult = ResponseParserService.parse(llmResponse);
      console.log('[Analysis] Response validation successful');

      // Step 7: Store in MongoDB
      console.log('[Analysis] Step 7: Storing analysis in MongoDB...');
      const processingTime = Date.now() - startTime;

      documentId = await AnalysisStorageService.saveAnalysis({
        policy_filename: policyFile.originalname,
        policy_upload_size: policyFile.size,
        policy_mime_type: policyFile.mimetype,
        prescription_provided: !!prescriptionFile,
        prescription_filename: prescriptionFile?.originalname,
        prescription_upload_size: prescriptionFile?.size,
        prescription_mime_type: prescriptionFile?.mimetype,
        analysis_result: analysisResult,
        processing_time_ms: processingTime,
        ocr_confidence: analysisResult.document_analysis.metadata.ocr_confidence,
        overall_confidence: analysisResult.document_analysis.metadata.overall_confidence,
        extraction_method: extractionMethod,
        processing_status: 'SUCCESS'
      });

      console.log(`[Analysis] Analysis complete in ${processingTime}ms`);

      // Step 8: Return response
      res.status(200).json({
        success: true,
        document_id: documentId,
        analysis_result: analysisResult,
        metadata: {
          processing_time_ms: processingTime,
          prescription_provided: !!prescriptionFile,
          extraction_method: extractionMethod,
          ocr_confidence: policyOcrResult.confidence
        }
      });
    } catch (error) {
      // If we have a documentId, try to save the error state
      if (documentId) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        try {
          await AnalysisStorageService.updateProcessingStatus(
            documentId,
            'FAILED',
            errorMessage
          );
        } catch (updateError) {
          console.error('[Analysis] Failed to update error status:', updateError);
        }
      }

      console.error('[Analysis] Pipeline failed:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }
}

export default new AnalysisController();

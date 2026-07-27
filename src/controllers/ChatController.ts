import { Request, Response, NextFunction } from 'express';
import AnalysisStorageService from '../services/AnalysisStorageService';
import PromptBuilderService from '../services/PromptBuilderService';
import LlmService from '../services/LlmService';

export class ChatController {
  async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { question } = req.body as { question?: string };

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QUESTION',
            message: 'question is required and must be a non-empty string'
          }
        });
        return;
      }

      const analysis = await AnalysisStorageService.getAnalysis(documentId);

      if (analysis.processing_status !== 'SUCCESS' || !analysis.analysis_result) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ANALYSIS_NOT_READY',
            message: 'This policy analysis is not available for questions'
          }
        });
        return;
      }

      console.log(`[Chat] Question for document ${documentId}: ${question}`);

      const prompt = PromptBuilderService.buildChatPrompt(analysis.analysis_result, question);
      const answer = await LlmService.analyze(prompt);

      res.status(200).json({
        success: true,
        document_id: documentId,
        question,
        answer: answer.trim()
      });
    } catch (error) {
      console.error('[Chat] Failed:', error instanceof Error ? error.message : String(error));
      next(error);
    }
  }
}

export default new ChatController();

import { Request, Response, NextFunction } from 'express';
import {
  OcrError,
  DocumentCleanError,
  PromptBuildError,
  LlmError,
  ParseError,
  StorageError,
  NotFoundError
} from '../types/analysis';

export interface ApiError {
  status: number;
  message: string;
  error_type: string;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message);

  let status = 500;
  let message = 'Internal server error';
  let errorType = 'UnknownError';

  if (err instanceof OcrError) {
    status = 400;
    message = err.message.includes('No files') ? 'No files provided' : 'Could not read or extract text from PDF file';
    errorType = 'OcrError';
  } else if (err instanceof DocumentCleanError) {
    status = 400;
    message = 'Failed to process document text';
    errorType = 'DocumentCleanError';
  } else if (err instanceof PromptBuildError) {
    status = 500;
    message = 'Failed to prepare analysis prompt';
    errorType = 'PromptBuildError';
  } else if (err instanceof LlmError) {
    status = 503;
    message = 'AI processing failed. Please try again';
    errorType = 'LlmError';
  } else if (err instanceof ParseError) {
    status = 500;
    message = 'Failed to parse AI response';
    errorType = 'ParseError';
  } else if (err instanceof StorageError) {
    status = 500;
    message = 'Failed to save analysis results';
    errorType = 'StorageError';
  } else if (err instanceof NotFoundError) {
    status = 404;
    message = 'Analysis not found';
    errorType = 'NotFoundError';
  } else if (err.message.includes('MONGODB_URI')) {
    status = 503;
    message = 'Database connection not configured';
    errorType = 'ConfigError';
  } else if (err.message.includes('File type') || err.message.includes('LIMIT_FILE_SIZE')) {
    status = 400;
    message = 'Invalid file. Please upload valid PDF documents (max 10MB).';
    errorType = 'FileError';
  }

  const apiError: ApiError = {
    status,
    message,
    error_type: errorType
  };

  res.status(status).json(apiError);
}

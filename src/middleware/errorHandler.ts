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
import {
  AccountNotFoundError,
  DuplicateEmailError,
  InvalidCredentialsError,
  UnauthorizedError,
  ValidationError
} from '../types/auth';
import { CaseNotFoundError, CaseStepOrderError, CaseValidationError } from '../types/coordinator';

export interface ApiError {
  status: number;
  message: string;
  error_type: string;
  errors?: Record<string, string>;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message);

  let status = 500;
  let message = 'Internal server error';
  let errorType = 'UnknownError';
  let fieldErrors: Record<string, string> | undefined;

  if (err instanceof ValidationError) {
    status = 400;
    message = 'Please correct the highlighted fields.';
    errorType = 'ValidationError';
    fieldErrors = err.fields;
  } else if (err instanceof DuplicateEmailError) {
    status = 409;
    message = err.message;
    errorType = 'DuplicateEmailError';
  } else if (err instanceof AccountNotFoundError) {
    status = 404;
    message = err.message;
    errorType = 'AccountNotFoundError';
  } else if (err instanceof InvalidCredentialsError) {
    status = 401;
    message = err.message;
    errorType = 'InvalidCredentialsError';
  } else if (err instanceof UnauthorizedError) {
    status = 401;
    message = err.message;
    errorType = 'UnauthorizedError';
  } else if (err instanceof CaseValidationError) {
    status = 400;
    message = err.message;
    errorType = 'CaseValidationError';
  } else if (err instanceof CaseStepOrderError) {
    status = 409;
    message = err.message;
    errorType = 'CaseStepOrderError';
  } else if (err instanceof CaseNotFoundError) {
    status = 404;
    message = err.message;
    errorType = 'CaseNotFoundError';
  } else if (err instanceof OcrError) {
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
    message = err.message;
    errorType = 'NotFoundError';
  } else if (err.message.includes('MONGODB_URI')) {
    status = 503;
    message = 'Database connection not configured';
    errorType = 'ConfigError';
  } else if (err.message.includes('MongoDB') || err.message.includes('Mongo')) {
    status = 503;
    message = 'Database connection unavailable';
    errorType = 'DatabaseUnavailableError';
  } else if (err.message.includes('File type') || err.message.includes('LIMIT_FILE_SIZE')) {
    status = 400;
    message = 'Invalid file. Please upload a supported document (PDF, JPG or PNG, max 10MB).';
    errorType = 'FileError';
  } else if (err.message.includes('E11000')) {
    status = 409;
    message = 'An account with this email already exists.';
    errorType = 'DuplicateEmailError';
  }

  const apiError: ApiError = {
    status,
    message,
    error_type: errorType,
    ...(fieldErrors && { errors: fieldErrors })
  };

  res.status(status).json(apiError);
}

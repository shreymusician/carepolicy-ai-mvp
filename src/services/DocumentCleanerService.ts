import { DocumentCleanError } from '../types/analysis';

export class DocumentCleanerService {
  clean(rawText: string): string {
    try {
      if (!rawText || typeof rawText !== 'string') {
        throw new DocumentCleanError('Input text is invalid or empty');
      }

      // Remove extra whitespace and normalize line breaks
      let cleaned = rawText
        // Normalize different line break styles
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove multiple consecutive spaces
        .replace(/[ \t]+/g, ' ')
        // Remove multiple consecutive newlines
        .replace(/\n\n+/g, '\n')
        // Trim each line
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        // Remove leading/trailing whitespace
        .trim();

      if (cleaned.length === 0) {
        throw new DocumentCleanError('Text is empty after cleaning');
      }

      return cleaned;
    } catch (error) {
      if (error instanceof DocumentCleanError) {
        throw error;
      }
      throw new DocumentCleanError(
        `Failed to clean document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default new DocumentCleanerService();

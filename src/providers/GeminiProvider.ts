import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider';
import { LlmError } from '../types/analysis';

/**
 * Google Gemini implementation of AIProvider.
 * All Gemini-specific request/response handling is isolated here —
 * no other part of the backend knows about the Gemini SDK.
 */
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required to construct GeminiProvider');
    }
    if (!modelName) {
      throw new Error('Gemini model name is required to construct GeminiProvider');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async analyze(prompt: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim().length === 0) {
        throw new LlmError('Gemini response text is empty');
      }

      return text;
    } catch (error) {
      if (error instanceof LlmError) {
        throw error;
      }
      throw new LlmError(`Gemini API request failed: ${this.extractErrorMessage(error)}`);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;

      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        return 'Invalid Gemini API key';
      }
      if (message.includes('429') || message.toLowerCase().includes('quota')) {
        return 'Gemini rate limit or quota exceeded';
      }
      if (message.includes('500') || message.includes('503')) {
        return 'Gemini API server error';
      }
      if (message.toLowerCase().includes('timeout')) {
        return 'Gemini API request timeout';
      }
      if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
        return 'Network error: cannot reach Gemini API';
      }

      return message;
    }

    return String(error);
  }
}

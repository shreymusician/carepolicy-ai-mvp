import { AIProvider } from '../providers/AIProvider';
import { GeminiProvider } from '../providers/GeminiProvider';
import { LlmError } from '../types/analysis';
import ConfigService from '../config/service';

/**
 * Provider-agnostic LLM orchestration: retries, backoff, and timeout.
 * The actual API call is delegated to an AIProvider implementation —
 * this service and its callers never know which vendor is behind it.
 */
export class LlmService {
  private provider: AIProvider;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(provider?: AIProvider) {
    this.provider = provider || LlmService.createConfiguredProvider();
    this.maxRetries = ConfigService.llm.retries;
    this.timeoutMs = ConfigService.llm.timeoutMs;
  }

  private static createConfiguredProvider(): AIProvider {
    const providerName = ConfigService.llm.provider;

    switch (providerName) {
      case 'gemini':
        return new GeminiProvider(ConfigService.llm.apiKey, ConfigService.llm.model);
      default:
        throw new Error(`Unsupported AI_PROVIDER: ${providerName}`);
    }
  }

  async analyze(prompt: string): Promise<string> {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new LlmError('Prompt is required and must be non-empty');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[LlmService] Attempt ${attempt}/${this.maxRetries}`);

        const text = await this.callWithTimeout(prompt, this.timeoutMs);

        console.log(`[LlmService] Success on attempt ${attempt}`);
        console.log(`[LlmService] Response length: ${text.length} characters`);

        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[LlmService] Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < this.maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.log(`[LlmService] Retrying in ${backoffMs}ms...`);
          await this.sleep(backoffMs);
        }
      }
    }

    throw new LlmError(
      `Failed to analyze text after ${this.maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  private async callWithTimeout(prompt: string, timeoutMs: number): Promise<string> {
    return Promise.race([
      this.provider.analyze(prompt),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new LlmService();

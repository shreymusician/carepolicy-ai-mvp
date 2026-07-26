/**
 * Provider-agnostic interface for AI text generation.
 * The rest of the backend depends only on this contract, never on a
 * specific vendor SDK or request/response shape.
 */
export interface AIProvider {
  analyze(prompt: string): Promise<string>;
}

import { ParseError, AnalysisResult } from '../types/analysis';

export class ResponseParserService {
  parse(responseText: string, _retryCount: number = 0): AnalysisResult {
    try {
      if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
        throw new ParseError('Response text is required and must be non-empty');
      }

      // Extract JSON from response (in case there's surrounding text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new ParseError('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonString);
      } catch (error) {
        const syntaxError = error instanceof Error ? error.message : 'Unknown error';
        throw new ParseError(`JSON parsing failed at position: ${syntaxError}`);
      }

      // Validate structure
      this.validateAnalysisResult(parsed);

      console.log('[ResponseParser] Successfully parsed and validated response');
      return parsed as AnalysisResult;
    } catch (error) {
      if (error instanceof ParseError) {
        throw error;
      }
      throw new ParseError(
        `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private validateAnalysisResult(obj: unknown): void {
    if (typeof obj !== 'object' || obj === null) {
      throw new ParseError('Response must be an object');
    }

    const result = obj as Record<string, unknown>;

    if (!result.document_analysis) {
      throw new ParseError('Missing required field: document_analysis');
    }

    const analysis = result.document_analysis as Record<string, unknown>;

    // Validate top-level structure
    const requiredFields = [
      'extracted_facts',
      'ai_generated_knowledge',
      'risk_assessment',
      'metadata'
    ];

    for (const field of requiredFields) {
      if (analysis[field] === undefined || analysis[field] === null) {
        throw new ParseError(`Missing required field in document_analysis: ${field}`);
      }
    }

    // Validate extracted_facts structure
    const facts = analysis.extracted_facts as Record<string, unknown>;
    if (!facts || typeof facts !== 'object') {
      throw new ParseError('extracted_facts must be an object');
    }

    if (!facts.policy_information) {
      throw new ParseError('Missing required field: extracted_facts.policy_information');
    }

    // Validate ai_generated_knowledge structure
    const aiKnowledge = analysis.ai_generated_knowledge as Record<string, unknown>;
    if (!aiKnowledge || typeof aiKnowledge !== 'object') {
      throw new ParseError('ai_generated_knowledge must be an object');
    }

    if (!aiKnowledge.policy_summary) {
      throw new ParseError('Missing required field: ai_generated_knowledge.policy_summary');
    }

    const policySummary = aiKnowledge.policy_summary as Record<string, unknown>;
    if (!policySummary.what_is_covered || !policySummary.what_is_not_covered) {
      throw new ParseError('policy_summary must include what_is_covered and what_is_not_covered');
    }

    // Validate risk_assessment structure
    const risks = analysis.risk_assessment as Record<string, unknown>;
    if (!risks || typeof risks !== 'object') {
      throw new ParseError('risk_assessment must be an object');
    }

    if (!Array.isArray(risks.critical_issues)) {
      risks.critical_issues = [];
    }
    if (!Array.isArray(risks.important_notes)) {
      risks.important_notes = [];
    }
    if (!Array.isArray(risks.general_notes)) {
      risks.general_notes = [];
    }

    // Validate metadata
    const metadata = analysis.metadata as Record<string, unknown>;
    if (!metadata || typeof metadata !== 'object') {
      throw new ParseError('metadata must be an object');
    }

    if (typeof metadata.overall_confidence !== 'string') {
      throw new ParseError('Invalid metadata: overall_confidence must be a string');
    }

    const validConfidence = ['high', 'medium', 'low'];
    if (!validConfidence.includes(metadata.overall_confidence)) {
      throw new ParseError(`Invalid confidence level: ${metadata.overall_confidence}`);
    }

    // Check for prescription_provided field
    if (typeof metadata.prescription_provided !== 'boolean') {
      throw new ParseError('metadata.prescription_provided must be a boolean');
    }

    console.log('[ResponseParser] Schema validation passed');
  }
}

export default new ResponseParserService();

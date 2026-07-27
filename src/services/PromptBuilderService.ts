import { PromptBuildError, AnalysisResult } from '../types/analysis';

export class PromptBuilderService {
  buildChatPrompt(analysisResult: AnalysisResult, question: string): string {
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw new PromptBuildError('Question is required and must be non-empty');
    }

    const analysis = analysisResult.document_analysis;

    const context = `POLICY FACTS:
${JSON.stringify(analysis.extracted_facts.policy_information, null, 2)}

EXCLUSIONS:
${JSON.stringify(analysis.extracted_facts.exclusions, null, 2)}

COVERAGE SUMMARY:
- What is covered: ${analysis.ai_generated_knowledge.policy_summary.what_is_covered}
- What is NOT covered: ${analysis.ai_generated_knowledge.policy_summary.what_is_not_covered}
- Key points: ${analysis.ai_generated_knowledge.policy_summary.key_points.join('; ')}

RELEVANT CLAUSES:
${JSON.stringify(analysis.ai_generated_knowledge.relevant_clauses, null, 2)}

RISK ASSESSMENT:
${JSON.stringify(analysis.risk_assessment, null, 2)}
${analysis.treatment_specific_summary
  ? `\nTREATMENT-SPECIFIC SUMMARY:\n${JSON.stringify(analysis.treatment_specific_summary, null, 2)}`
  : ''}`;

    return `You are CarePolicy AI, answering a patient's question about their own insurance policy using ONLY the analysis context below. Do not invent facts that are not present in the context.

${context}

USER QUESTION:
${question}

INSTRUCTIONS:
- Answer in 2-4 short sentences, plain language, no jargon.
- Base your answer strictly on the context above.
- If the context does not contain enough information to answer confidently, say so clearly and suggest the user confirm with their insurer.
- Use cautious language ("appears to", "may", "likely") — never claim a treatment is definitely approved or rejected.
- Return plain text only. Do NOT return JSON or markdown formatting.

ANSWER:`;
  }

  buildAnalysisPrompt(policyText: string, prescriptionText?: string): string {
    try {
      if (!policyText || typeof policyText !== 'string' || policyText.trim().length === 0) {
        throw new PromptBuildError('Policy text is required and must be non-empty');
      }

      const systemPrompt = `You are an AI assistant analyzing insurance policies for hospital staff.

Your role is to:
1. Extract facts directly stated in the policy
2. Generate plain-language explanations
3. Identify potentially relevant clauses
4. Flag potential issues and risks
5. Provide confidence scores for each extraction

IMPORTANT:
- You do NOT determine if a treatment is approved
- You only identify what APPEARS to be relevant
- Use cautious language: "appears to", "may", "likely"
- All outputs must be trustworthy and transparent
- Always mark confidence levels

Return ONLY valid JSON. No markdown. No explanations outside the JSON structure.`;

      const policySection = `INSURANCE POLICY TEXT:
${policyText}`;

      const prescriptionSection = prescriptionText
        ? `
DOCTOR PRESCRIPTION / TREATMENT DETAILS:
${prescriptionText}`
        : '';

      const jsonSchemaInstructions = `
JSON RESPONSE SCHEMA:
{
  "document_analysis": {
    "extracted_facts": {
      "policy_information": {
        "policy_number": { "value": "...", "confidence": "high/medium/low", "source": "Extracted from document" },
        "policyholder_name": { "value": "...", "confidence": "high/medium/low", "source": "Extracted from document" },
        "policy_start_date": { "value": "YYYY-MM-DD", "confidence": "high/medium/low", "source": "Extracted from document" },
        "policy_end_date": { "value": "YYYY-MM-DD", "confidence": "high/medium/low", "source": "Extracted from document" },
        "annual_coverage_limit": { "value": "...", "confidence": "high/medium/low", "source": "Extracted from document" },
        "room_rent_limit": { "value": "...", "confidence": "high/medium/low", "source": "Extracted from document" },
        "waiting_period": { "value": "...", "confidence": "high/medium/low", "source": "Extracted from document" }
      },
      "exclusions": [
        { "exclusion": "...", "details": "...", "confidence": "high/medium/low" }
      ]
    },
    "ai_generated_knowledge": {
      "policy_summary": {
        "what_is_covered": "Plain language explanation in 2-3 sentences",
        "what_is_not_covered": "Plain language explanation in 2-3 sentences",
        "key_points": ["point 1", "point 2", "point 3"],
        "source": "AI-generated explanation"
      },
      "relevant_clauses": [
        {
          "clause_name": "...",
          "reason_relevant": "...",
          "clause_details": "...",
          "appears_applicable": true/false,
          "confidence": "high/medium/low",
          "source": "Matched to prescription context"
        }
      ]
    },
    "risk_assessment": {
      "critical_issues": [
        { "severity": "critical", "issue": "...", "explanation": "...", "action_required": "..." }
      ],
      "important_notes": [
        { "severity": "important", "issue": "...", "explanation": "..." }
      ],
      "general_notes": [
        { "severity": "info", "issue": "...", "explanation": "..." }
      ]
    },
    "treatment_specific_summary": ${prescriptionText ? `{
      "treatment": "...",
      "diagnosis": "...",
      "appears_covered": "...",
      "coverage_explanation": "...",
      "potential_financial_responsibility": "...",
      "important_treatment_notes": ["note 1", "note 2"],
      "source": "AI analysis of prescription against policy"
    }` : 'null'},
    "metadata": {
      "prescription_provided": ${prescriptionText ? 'true' : 'false'},
      "overall_confidence": "high/medium/low",
      "confidence_explanation": "Brief explanation of confidence level",
      "processing_complete": true,
      "processing_time_ms": 0,
      "document_quality": "good/fair/poor",
      "ocr_confidence": "high/medium/low"
    }
  }
}

EXTRACTION RULES:
- For each extracted field, assign confidence:
  - "high": Clearly and explicitly stated
  - "medium": Can be reasonably inferred but has ambiguity
  - "low": Unclear, conflicting, or requires interpretation

LANGUAGE RULES FOR PRESCRIPTION MATCHING:
- Use "appears relevant" not "is relevant"
- Use "may be covered" not "is covered"
- Use "could affect" not "will affect"
- Flag uncertainties with confidence levels
- Never claim treatment is "approved" or "rejected"
`;

      const prompt = `${systemPrompt}

${policySection}${prescriptionSection}

${jsonSchemaInstructions}`;

      return prompt;
    } catch (error) {
      if (error instanceof PromptBuildError) {
        throw error;
      }
      throw new PromptBuildError(
        `Failed to build prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default new PromptBuilderService();

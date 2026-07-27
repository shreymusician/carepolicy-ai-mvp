import { PromptBuildError, AnalysisResult } from '../types/analysis';

export interface PolicyExplainInput {
  company_name: string;
  policy_name: string;
  policy_type: string;
  description?: string;
  coverage_summary?: string;
  waiting_period?: string;
  eligibility?: string;
  sum_insured_label?: string;
  key_benefits?: string[];
  key_exclusions?: string[];
}

export interface PolicyKnowledgeInput {
  uin: string;
  companyName: string;
  productName: string;
  documentText: string;
  topics: readonly string[];
}

export class PromptBuilderService {
  /**
   * Extracts the full structured knowledge set from an official policy document.
   * Every fact carries its own source/confidence/page so the UI can stay traceable.
   */
  buildPolicyKnowledgePrompt(input: PolicyKnowledgeInput): string {
    if (!input.documentText || input.documentText.trim().length === 0) {
      throw new PromptBuildError('Document text is required to extract policy knowledge');
    }

    const factSchema = input.topics
      .map(t => `    "${t}": { "value": string|null, "source": string|null, "confidence": number|null, "page_number": number|null }`)
      .join(',\n');

    return `You are an insurance analyst reading an official IRDAI-approved policy document. Extract structured facts EXACTLY as stated in the document.

PRODUCT: ${input.productName} (${input.companyName})
UIN: ${input.uin}

OFFICIAL POLICY DOCUMENT TEXT:
${input.documentText}

Return ONLY valid JSON in exactly this shape. No markdown, no commentary:
{
  "facts": {
${factSchema}
  },
  "citizen_summary": string|null,
  "worker_summary": string|null,
  "faqs": [ { "question": string, "answer": string, "confidence": number|null, "page_number": number|null } ],
  "claim_knowledge": {
    "required_documents": string[],
    "common_rejection_reasons": string[],
    "mandatory_signatures": string[],
    "hospital_requirements": string[],
    "document_checklist": string[]
  },
  "searchable_terms": string[]
}

CRITICAL RULES — accuracy matters more than completeness:
- If the document does not state something, set "value" to null. NEVER guess, infer, or fill from general insurance knowledge.
- "value" must reflect what the document says (figures, durations, limits) — quote numbers exactly as written.
- "source" = a short quoted phrase or section reference from the document supporting the value, or null.
- "page_number" = the page the fact appears on if determinable from the text, otherwise null.
- "confidence" = 0-100 integer reflecting how explicitly the document states it. Use null if the value is null.
- "citizen_summary" = 2-3 plain sentences a non-expert can understand. Null if too little information.
- "worker_summary" = 2-3 sentences for a hospital/insurance worker, focused on coverage limits and claim-relevant terms.
- "faqs" = up to 8 questions a real policyholder would ask, answered ONLY from this document (e.g. cataract cover, adding parents, waiting period length, maternity, mental health). Omit any question the document cannot answer.
- "claim_knowledge" = only items the document actually states; use empty arrays otherwise.
- "searchable_terms" = lowercase keywords for search: diseases, treatments, procedures and benefits this policy explicitly mentions (e.g. "cataract", "maternity", "dengue", "ayush", "day care"). Only include terms actually present in the document.
- Never state that a treatment is guaranteed or approved.`;
  }

  buildPolicyExplainPrompt(policy: PolicyExplainInput): string {
    const facts = [
      `Insurer: ${policy.company_name}`,
      `Plan name: ${policy.policy_name}`,
      `Plan type: ${policy.policy_type}`,
      policy.description ? `Description: ${policy.description}` : null,
      policy.coverage_summary ? `Coverage (official wording): ${policy.coverage_summary}` : null,
      policy.waiting_period ? `Waiting periods (official wording): ${policy.waiting_period}` : null,
      policy.eligibility ? `Eligibility (official wording): ${policy.eligibility}` : null,
      policy.sum_insured_label ? `Sum insured options: ${policy.sum_insured_label}` : null,
      policy.key_benefits?.length ? `Listed benefits: ${policy.key_benefits.join('; ')}` : null,
      policy.key_exclusions?.length ? `Listed limits/exclusions: ${policy.key_exclusions.join('; ')}` : null
    ]
      .filter(Boolean)
      .join('\n');

    if (!facts.trim()) {
      throw new PromptBuildError('No policy information available to explain');
    }

    return `You are CarePolicy AI. Rewrite the official insurance information below into plain, everyday language that someone with no insurance knowledge can understand.

OFFICIAL INFORMATION (transcribed from the insurer's own documents):
${facts}

Return ONLY valid JSON in exactly this shape, no markdown:
{
  "in_simple_terms": "2-3 short sentences explaining what this plan is, in everyday words",
  "what_it_covers": ["short plain-language point", "..."],
  "what_to_watch_out_for": ["short plain-language point about waiting periods, limits or exclusions", "..."],
  "who_its_for": "one short sentence describing the kind of person/family this plan suits",
  "waiting_period_explained": "plain-language explanation of the waiting periods, or empty string if none were provided"
}

RULES:
- Use ONLY the information above. Do not add facts, numbers, or benefits that are not stated.
- Translate jargon: 'sum insured' = the maximum amount the insurer pays per year; 'pre-existing disease waiting period' = how long you must wait before conditions you already had are covered; 'indemnity' = reimburses actual bills.
- Keep every point under 20 words. Avoid insurance jargon in the output.
- If a section has no supporting information, return an empty array or empty string for it.
- Never state that a specific treatment is approved or guaranteed.`;
  }

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

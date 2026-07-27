import { createHash } from 'crypto';
import OcrService from '../OcrService';
import DocumentCleanerService from '../DocumentCleanerService';
import PromptBuilderService from '../PromptBuilderService';
import LlmService from '../LlmService';
import InsurancePolicy, { IInsurancePolicy } from '../../models/InsurancePolicy';
import PolicyKnowledge, {
  KNOWLEDGE_TOPICS,
  IKnowledgeField,
  IFaq,
  IClaimKnowledge,
  ExtractionStatus
} from '../../models/PolicyKnowledge';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Current shape of the extraction. Bump when the prompt or schema changes so a
// re-run regenerates knowledge produced by an older version.
export const KNOWLEDGE_VERSION = 1;

// Keeps the prompt within a comfortable size for long policy wordings.
const MAX_DOCUMENT_CHARS = 120000;

export interface ExtractionOutcome {
  uin: string;
  status: ExtractionStatus | 'unchanged';
  reason?: string;
  factsExtracted?: number;
}

export interface BuildKnowledgeResult {
  processed: number;
  extracted: number;
  unchanged: number;
  failed: number;
  outcomes: ExtractionOutcome[];
}

export class KnowledgeExtractionService {
  /**
   * Builds structured knowledge for policies that have an official document.
   * Skips policies whose document hash and knowledge version are already current,
   * so re-running only regenerates what actually changed.
   */
  async buildForAll(options: { limit?: number; force?: boolean; uin?: string } = {}): Promise<BuildKnowledgeResult> {
    const query: Record<string, unknown> = {
      is_active: true,
      official_policy_pdf_url: { $exists: true, $ne: null }
    };
    if (options.uin) query.uin = options.uin.toUpperCase();

    const policies = await InsurancePolicy.find(query).limit(options.limit ?? 0);
    const result: BuildKnowledgeResult = {
      processed: 0,
      extracted: 0,
      unchanged: 0,
      failed: 0,
      outcomes: []
    };

    for (const policy of policies) {
      result.processed++;
      const outcome = await this.buildForPolicy(policy, options.force === true);
      result.outcomes.push(outcome);

      if (outcome.status === 'unchanged') result.unchanged++;
      else if (outcome.status === 'success' || outcome.status === 'partial') result.extracted++;
      else result.failed++;

      console.log(`[Knowledge] ${outcome.uin}: ${outcome.status}${outcome.reason ? ` (${outcome.reason})` : ''}`);
    }

    return result;
  }

  async buildForPolicy(policy: IInsurancePolicy, force = false): Promise<ExtractionOutcome> {
    const uin = policy.uin;
    const label = uin || policy._id.toString();
    const key = { policy_id: policy._id };

    if (!policy.official_policy_pdf_url) {
      return { uin: label, status: 'failed', reason: 'no official document url' };
    }

    try {
      const buffer = await this.download(policy.official_policy_pdf_url);
      const documentHash = createHash('sha256').update(buffer).digest('hex');

      const existing = await PolicyKnowledge.findOne(key);
      const isCurrent =
        existing &&
        existing.document_hash === documentHash &&
        existing.knowledge_version === KNOWLEDGE_VERSION &&
        existing.extraction_status === 'success';

      if (isCurrent && !force) {
        return { uin: label, status: 'unchanged' };
      }

      const ocr = await OcrService.extractTextFromPdf(buffer);
      const cleaned = DocumentCleanerService.clean(ocr.text || '');

      if (!cleaned || cleaned.trim().length < 500) {
        await this.persistFailure(policy, uin, documentHash, ocr.pageCount, 'document text not readable');
        return { uin: label, status: 'failed', reason: 'document text not readable' };
      }

      const prompt = PromptBuilderService.buildPolicyKnowledgePrompt({
        uin: label,
        companyName: policy.company_name,
        productName: policy.policy_name,
        documentText: cleaned.slice(0, MAX_DOCUMENT_CHARS),
        topics: KNOWLEDGE_TOPICS
      });

      const raw = await LlmService.analyze(prompt);
      const parsed = this.parseResponse(raw);

      if (!parsed) {
        await this.persistFailure(policy, uin, documentHash, ocr.pageCount, 'AI response was not valid JSON');
        return { uin: label, status: 'failed', reason: 'AI response was not valid JSON' };
      }

      const facts = this.normaliseFacts(parsed.facts);
      const populated = Object.values(facts).filter(f => f.value !== null).length;
      const status: ExtractionStatus = populated === 0 ? 'failed' : populated < 5 ? 'partial' : 'success';

      const now = new Date();
      await PolicyKnowledge.findOneAndUpdate(
        key,
        {
          $set: {
            policy_id: policy._id,
            ...(uin ? { uin } : {}),
            facts,
            citizen_summary: this.text(parsed.citizen_summary),
            worker_summary: this.text(parsed.worker_summary),
            faqs: this.normaliseFaqs(parsed.faqs),
            claim_knowledge: this.normaliseClaimKnowledge(parsed.claim_knowledge),
            searchable_terms: this.normaliseTerms(parsed.searchable_terms, policy),
            source_document_url: policy.official_policy_pdf_url,
            document_hash: documentHash,
            document_page_count: ocr.pageCount,
            knowledge_version: KNOWLEDGE_VERSION,
            extraction_status: status,
            extraction_error: undefined,
            last_ai_extraction_at: now,
            updated_at: now
          },
          $setOnInsert: { created_at: now }
        },
        { upsert: true, new: true }
      );

      return { uin: label, status, factsExtracted: populated };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.persistFailure(policy, uin, undefined, undefined, reason);
      return { uin: label, status: 'failed', reason };
    }
  }

  private async persistFailure(
    policy: IInsurancePolicy,
    uin: string | undefined,
    documentHash?: string,
    pageCount?: number,
    reason?: string
  ): Promise<void> {
    const now = new Date();
    await PolicyKnowledge.findOneAndUpdate(
      { policy_id: policy._id },
      {
        $set: {
          policy_id: policy._id,
          ...(uin ? { uin } : {}),
          source_document_url: policy.official_policy_pdf_url,
          ...(documentHash ? { document_hash: documentHash } : {}),
          ...(pageCount ? { document_page_count: pageCount } : {}),
          knowledge_version: KNOWLEDGE_VERSION,
          extraction_status: 'failed' as const,
          extraction_error: reason,
          last_ai_extraction_at: now,
          updated_at: now
        },
        $setOnInsert: { created_at: now }
      },
      { upsert: true }
    );
  }

  private parseResponse(raw: string): Record<string, any> | null {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  }

  /** Only known topics are kept, and anything unverifiable stays null. */
  private normaliseFacts(input: unknown): Record<string, IKnowledgeField> {
    const source = (input && typeof input === 'object' ? input : {}) as Record<string, any>;
    const facts: Record<string, IKnowledgeField> = {};

    for (const topic of KNOWLEDGE_TOPICS) {
      const entry = source[topic];
      const value = this.text(entry?.value);

      facts[topic] = {
        value,
        source: value ? this.text(entry?.source) : null,
        confidence: value ? this.confidence(entry?.confidence) : null,
        page_number: value ? this.page(entry?.page_number) : null
      };
    }

    return facts;
  }

  private normaliseFaqs(input: unknown): IFaq[] {
    if (!Array.isArray(input)) return [];
    return input
      .map(f => ({
        question: this.text(f?.question),
        answer: this.text(f?.answer),
        confidence: this.confidence(f?.confidence),
        page_number: this.page(f?.page_number)
      }))
      .filter((f): f is IFaq => Boolean(f.question && f.answer))
      .slice(0, 12);
  }

  private normaliseClaimKnowledge(input: unknown): IClaimKnowledge {
    const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
    const list = (v: unknown): string[] =>
      Array.isArray(v)
        ? v.map(x => this.text(x)).filter((x): x is string => Boolean(x)).slice(0, 25)
        : [];

    return {
      required_documents: list(src.required_documents),
      common_rejection_reasons: list(src.common_rejection_reasons),
      mandatory_signatures: list(src.mandatory_signatures),
      hospital_requirements: list(src.hospital_requirements),
      document_checklist: list(src.document_checklist)
    };
  }

  private normaliseTerms(input: unknown, policy: IInsurancePolicy): string[] {
    const terms = new Set<string>();

    if (Array.isArray(input)) {
      for (const t of input) {
        const v = this.text(t);
        if (v && v.length <= 60) terms.add(v.toLowerCase());
      }
    }

    // Product identity is always searchable.
    terms.add(policy.policy_name.toLowerCase());
    terms.add(policy.company_name.toLowerCase());
    if (policy.policy_type) terms.add(policy.policy_type.toLowerCase());

    return [...terms].slice(0, 200);
  }

  private text(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;
    if (['null', 'n/a', 'na', 'not stated', 'not available', 'unknown'].includes(v.toLowerCase())) return null;
    return v;
  }

  private confidence(value: unknown): number | null {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  private page(value: unknown): number | null {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  private async download(url: string): Promise<Buffer> {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(90000)
    });
    if (!res.ok) throw new Error(`document download failed: HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

export default new KnowledgeExtractionService();

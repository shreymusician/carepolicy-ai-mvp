import InsuranceCompany, { IInsuranceCompany } from '../models/InsuranceCompany';
import InsurancePolicy, { IInsurancePolicy } from '../models/InsurancePolicy';
import PolicyKnowledge, { IPolicyKnowledge, IKnowledgeField } from '../models/PolicyKnowledge';
import { NotFoundError } from '../types/analysis';

export interface PolicyFilters {
  company?: string;
  policyType?: string;
  targetAudience?: string;
  verificationStatus?: string;
  sourceType?: string;
  uin?: string;
}

export class InsuranceService {
  async listCompanies(): Promise<IInsuranceCompany[]> {
    return InsuranceCompany.find({ is_active: true }).sort({ name: 1 });
  }

  async listPolicies(filters: PolicyFilters = {}): Promise<IInsurancePolicy[]> {
    return InsurancePolicy.find(this.buildQuery(filters)).sort({ company_name: 1, policy_name: 1 });
  }

  async getPolicyById(id: string): Promise<IInsurancePolicy> {
    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      throw new NotFoundError(`Insurance policy not found: ${id}`);
    }
    return policy;
  }

  async search(q: string, filters: PolicyFilters = {}): Promise<IInsurancePolicy[]> {
    const query = this.buildQuery(filters);
    const term = (q || '').trim();

    if (term.length === 0) {
      return InsurancePolicy.find(query).sort({ company_name: 1, policy_name: 1 }).limit(50);
    }

    // Product-level text match (name, company, description).
    const direct = await InsurancePolicy.find(
      { ...query, $text: { $search: term } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    // Knowledge-level match so a disease/treatment/benefit finds policies whose
    // official document mentions it (e.g. "dengue", "maternity", "cataract").
    const knowledgeIds = await this.policyIdsMatchingKnowledge(term);
    if (knowledgeIds.length === 0) return direct;

    const seen = new Set(direct.map(p => p._id.toString()));
    const extra = await InsurancePolicy.find({
      ...query,
      _id: { $in: knowledgeIds.filter(id => !seen.has(id.toString())) }
    }).limit(50);

    return [...direct, ...extra].slice(0, 50);
  }

  /**
   * Smart search over extracted knowledge. Uses the searchable_terms index plus a
   * substring fallback so partial words ("matern") still resolve.
   */
  private async policyIdsMatchingKnowledge(term: string): Promise<IPolicyKnowledge['policy_id'][]> {
    const lower = term.toLowerCase();
    const rx = new RegExp(this.escapeRegex(lower), 'i');

    const matches = await PolicyKnowledge.find(
      {
        extraction_status: { $in: ['success', 'partial'] },
        $or: [{ searchable_terms: rx }, { $text: { $search: term } }]
      },
      { policy_id: 1 }
    ).limit(50);

    return matches.map(m => m.policy_id);
  }

  async getKnowledgeByPolicyId(policyId: string): Promise<IPolicyKnowledge | null> {
    return PolicyKnowledge.findOne({ policy_id: policyId });
  }

  /**
   * Backend support for policy comparison. Returns the requested policies aligned
   * on the same knowledge topics so a UI can render them side by side later.
   */
  async comparePolicies(
    policyIds: string[],
    topics: string[]
  ): Promise<
    Array<{
      policy_id: string;
      policy_name: string;
      company_name: string;
      uin?: string;
      facts: Record<string, IKnowledgeField | null>;
    }>
  > {
    const policies = await InsurancePolicy.find({ _id: { $in: policyIds } });
    const knowledge = await PolicyKnowledge.find({ policy_id: { $in: policyIds } });
    const byPolicy = new Map(knowledge.map(k => [k.policy_id.toString(), k]));

    return policies.map(p => {
      const k = byPolicy.get(p._id.toString());
      const facts: Record<string, IKnowledgeField | null> = {};

      for (const topic of topics) {
        const field = k?.facts ? (k.facts as any).get?.(topic) ?? (k.facts as any)[topic] : undefined;
        facts[topic] = field ?? null;
      }

      return {
        policy_id: p._id.toString(),
        policy_name: p.policy_name,
        company_name: p.company_name,
        uin: p.uin,
        facts
      };
    });
  }

  // Filters are additive — new ones can be appended without changing callers.
  private buildQuery(filters: PolicyFilters): Record<string, unknown> {
    const query: Record<string, unknown> = { is_active: true };

    if (filters.company) {
      query.company_name = new RegExp(this.escapeRegex(filters.company), 'i');
    }
    if (filters.policyType) {
      query.policy_type = new RegExp(`^${this.escapeRegex(filters.policyType)}$`, 'i');
    }
    if (filters.targetAudience) {
      query.target_audience = new RegExp(this.escapeRegex(filters.targetAudience), 'i');
    }
    if (filters.verificationStatus) {
      query.verification_status = filters.verificationStatus;
    }
    if (filters.sourceType) {
      query.source_type = filters.sourceType.toUpperCase();
    }
    if (filters.uin) {
      query.uin = filters.uin.toUpperCase();
    }

    return query;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default new InsuranceService();

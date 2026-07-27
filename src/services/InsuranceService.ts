import InsuranceCompany, { IInsuranceCompany } from '../models/InsuranceCompany';
import InsurancePolicy, { IInsurancePolicy } from '../models/InsurancePolicy';
import { NotFoundError } from '../types/analysis';

export interface PolicyFilters {
  company?: string;
  policyType?: string;
  targetAudience?: string;
}

export class InsuranceService {
  async listCompanies(): Promise<IInsuranceCompany[]> {
    return InsuranceCompany.find({ is_active: true }).sort({ name: 1 });
  }

  async listPolicies(filters: PolicyFilters = {}): Promise<IInsurancePolicy[]> {
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

    return InsurancePolicy.find(query).sort({ company_name: 1, policy_name: 1 });
  }

  async getPolicyById(id: string): Promise<IInsurancePolicy> {
    const policy = await InsurancePolicy.findById(id);
    if (!policy) {
      throw new NotFoundError(`Insurance policy not found: ${id}`);
    }
    return policy;
  }

  async search(q: string, filters: PolicyFilters = {}): Promise<IInsurancePolicy[]> {
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

    if (q && q.trim().length > 0) {
      query.$text = { $search: q.trim() };
      return InsurancePolicy.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(50);
    }

    return InsurancePolicy.find(query).sort({ company_name: 1, policy_name: 1 }).limit(50);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default new InsuranceService();

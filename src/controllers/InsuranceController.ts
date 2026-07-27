import { Request, Response, NextFunction } from 'express';
import InsuranceService from '../services/InsuranceService';
import PromptBuilderService from '../services/PromptBuilderService';
import LlmService from '../services/LlmService';

export class InsuranceController {
  async getCompanies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await InsuranceService.listCompanies();
      res.status(200).json({ success: true, companies });
    } catch (error) {
      next(error);
    }
  }

  async getPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { company, policyType, targetAudience, verificationStatus } = req.query;
      const policies = await InsuranceService.listPolicies({
        company: typeof company === 'string' ? company : undefined,
        policyType: typeof policyType === 'string' ? policyType : undefined,
        targetAudience: typeof targetAudience === 'string' ? targetAudience : undefined,
        verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
        sourceType: typeof req.query.sourceType === 'string' ? req.query.sourceType : undefined,
        uin: typeof req.query.uin === 'string' ? req.query.uin : undefined
      });
      res.status(200).json({ success: true, count: policies.length, policies });
    } catch (error) {
      next(error);
    }
  }

  async getPolicyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await InsuranceService.getPolicyById(req.params.id);
      res.status(200).json({ success: true, policy });
    } catch (error) {
      next(error);
    }
  }

  async explainPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await InsuranceService.getPolicyById(req.params.id);

      const hasContent =
        policy.coverage_summary ||
        policy.waiting_period ||
        policy.eligibility ||
        policy.description ||
        (policy.key_benefits && policy.key_benefits.length > 0);

      if (!hasContent) {
        res.status(200).json({
          success: true,
          available: false,
          explanation: null,
          message:
            'We only explain coverage using official IRDAI or insurer documents. Official details for this product are not available yet.'
        });
        return;
      }

      const prompt = PromptBuilderService.buildPolicyExplainPrompt({
        company_name: policy.company_name,
        policy_name: policy.policy_name,
        policy_type: policy.policy_type,
        description: policy.description,
        coverage_summary: policy.coverage_summary,
        waiting_period: policy.waiting_period,
        eligibility: policy.eligibility,
        sum_insured_label: policy.sum_insured_range?.label,
        key_benefits: policy.key_benefits,
        key_exclusions: policy.key_exclusions
      });

      const raw = await LlmService.analyze(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        res.status(200).json({
          success: true,
          available: false,
          explanation: null,
          message: 'We could not prepare a reliable explanation for this product right now.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        available: true,
        explanation: JSON.parse(match[0]),
        source_type: policy.source_type || 'INSURER',
        uin: policy.uin
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, company, policyType, targetAudience, verificationStatus } = req.query;
      const policies = await InsuranceService.search(typeof q === 'string' ? q : '', {
        company: typeof company === 'string' ? company : undefined,
        policyType: typeof policyType === 'string' ? policyType : undefined,
        targetAudience: typeof targetAudience === 'string' ? targetAudience : undefined,
        verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
        sourceType: typeof req.query.sourceType === 'string' ? req.query.sourceType : undefined,
        uin: typeof req.query.uin === 'string' ? req.query.uin : undefined
      });
      res.status(200).json({ success: true, count: policies.length, policies });
    } catch (error) {
      next(error);
    }
  }
}

export default new InsuranceController();

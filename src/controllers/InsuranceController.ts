import { Request, Response, NextFunction } from 'express';
import InsuranceService from '../services/InsuranceService';

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
      const { company, policyType, targetAudience } = req.query;
      const policies = await InsuranceService.listPolicies({
        company: typeof company === 'string' ? company : undefined,
        policyType: typeof policyType === 'string' ? policyType : undefined,
        targetAudience: typeof targetAudience === 'string' ? targetAudience : undefined
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

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, company, policyType, targetAudience } = req.query;
      const policies = await InsuranceService.search(typeof q === 'string' ? q : '', {
        company: typeof company === 'string' ? company : undefined,
        policyType: typeof policyType === 'string' ? policyType : undefined,
        targetAudience: typeof targetAudience === 'string' ? targetAudience : undefined
      });
      res.status(200).json({ success: true, count: policies.length, policies });
    } catch (error) {
      next(error);
    }
  }
}

export default new InsuranceController();

import { Response, NextFunction } from 'express';
import PriorAuthCaseService from '../services/PriorAuthCaseService';
import { AuthenticatedRequest } from '../middleware/auth';
import { CaseValidationError } from '../types/coordinator';
import { DocumentCategory } from '../models/PriorAuthCase';
import { UnauthorizedError } from '../types/auth';

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'discharge_summary',
  'medical_reports',
  'lab_reports',
  'bills',
  'prescriptions'
];

function requireUser(req: AuthenticatedRequest): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

export class CoordinatorController {
  async listCases(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const cases = await PriorAuthCaseService.listCases(coordinatorId);
      res.status(200).json({ success: true, cases });
    } catch (error) {
      next(error);
    }
  }

  async createCase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.createCase(coordinatorId, req.body?.patient_name);
      res.status(201).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async getCase(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.getCase(coordinatorId, req.params.caseId);
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async selectInsurance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.selectInsurance(
        coordinatorId,
        req.params.caseId,
        req.body?.policy_id
      );
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async confirmPolicyReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.confirmPolicyReview(coordinatorId, req.params.caseId);
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const category = req.body?.category as DocumentCategory;
      if (!DOCUMENT_CATEGORIES.includes(category)) {
        throw new CaseValidationError('Choose a valid document category before uploading.');
      }

      const file = req.file;
      if (!file) {
        throw new CaseValidationError('No file was received. Please try uploading again.');
      }

      const caseDetail = await PriorAuthCaseService.addDocument(coordinatorId, req.params.caseId, category, {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
      res.status(201).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.removeDocument(
        coordinatorId,
        req.params.caseId,
        req.params.documentId
      );
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async confirmMedicalRecords(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.confirmMedicalRecords(coordinatorId, req.params.caseId);
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }

  async generatePriorAuthorization(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coordinatorId = requireUser(req);
      const caseDetail = await PriorAuthCaseService.generatePriorAuthorization(coordinatorId, req.params.caseId);
      res.status(200).json({ success: true, case: caseDetail });
    } catch (error) {
      next(error);
    }
  }
}

export default new CoordinatorController();

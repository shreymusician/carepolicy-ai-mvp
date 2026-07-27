import { Router } from 'express';
import InsuranceController from '../controllers/InsuranceController';

const router = Router();

router.get('/insurance/companies', (req, res, next) => InsuranceController.getCompanies(req, res, next));
router.get('/insurance/policies', (req, res, next) => InsuranceController.getPolicies(req, res, next));
router.get('/insurance/search', (req, res, next) => InsuranceController.search(req, res, next));
router.get('/insurance/compare', (req, res, next) => InsuranceController.comparePolicies(req, res, next));
router.get('/insurance/policies/:id', (req, res, next) => InsuranceController.getPolicyById(req, res, next));
router.get('/insurance/policies/:id/knowledge', (req, res, next) => InsuranceController.getPolicyKnowledge(req, res, next));
router.post('/insurance/policies/:id/explain', (req, res, next) => InsuranceController.explainPolicy(req, res, next));

export default router;

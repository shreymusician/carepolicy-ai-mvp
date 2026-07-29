import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/auth/policy-holder/signup', (req, res, next) => AuthController.signupPolicyHolder(req, res, next));
router.post('/auth/policy-holder/login', (req, res, next) => AuthController.loginPolicyHolder(req, res, next));

router.post('/auth/coordinator/signup', (req, res, next) => AuthController.signupCoordinator(req, res, next));
router.post('/auth/coordinator/login', (req, res, next) => AuthController.loginCoordinator(req, res, next));

router.post('/auth/demo/login', (req, res, next) => AuthController.demoLoginPolicyHolder(req, res, next));

router.post('/auth/logout', (req, res, next) => AuthController.logout(req, res).catch(next));
router.get('/auth/verify', requireAuth, (req, res, next) => AuthController.verify(req, res, next));
router.get('/auth/me', requireAuth, (req, res, next) => AuthController.me(req, res, next));

export default router;

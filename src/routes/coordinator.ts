import { Router } from 'express';
import multer from 'multer';
import CoordinatorController from '../controllers/CoordinatorController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use('/coordinator', requireAuth, requireRole('insurance_coordinator'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`));
    }
  }
});

router.get('/coordinator/cases', (req, res, next) => CoordinatorController.listCases(req, res, next));
router.post('/coordinator/cases', (req, res, next) => CoordinatorController.createCase(req, res, next));
router.get('/coordinator/cases/:caseId', (req, res, next) => CoordinatorController.getCase(req, res, next));

router.put('/coordinator/cases/:caseId/insurance-selection', (req, res, next) =>
  CoordinatorController.selectInsurance(req, res, next)
);
router.put('/coordinator/cases/:caseId/policy-review', (req, res, next) =>
  CoordinatorController.confirmPolicyReview(req, res, next)
);

router.post('/coordinator/cases/:caseId/documents', upload.single('file'), (req, res, next) =>
  CoordinatorController.uploadDocument(req, res, next)
);
router.delete('/coordinator/cases/:caseId/documents/:documentId', (req, res, next) =>
  CoordinatorController.deleteDocument(req, res, next)
);
router.put('/coordinator/cases/:caseId/medical-records', (req, res, next) =>
  CoordinatorController.confirmMedicalRecords(req, res, next)
);

router.post('/coordinator/cases/:caseId/generate', (req, res, next) =>
  CoordinatorController.generatePriorAuthorization(req, res, next)
);

export default router;

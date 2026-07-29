import { Router } from 'express';
import multer from 'multer';
import AnalysisController from '../controllers/AnalysisController';
import ChatController from '../controllers/ChatController';
import { getDemoWorkflowPayload } from '../mock/demoWorkflow';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept PDFs and images
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`));
    }
  }
});

// POST /api/analyze
// Upload insurance policy and optional prescription
router.post(
  '/analyze',
  upload.fields([
    { name: 'policy', maxCount: 1 },
    { name: 'prescription', maxCount: 1 }
  ]),
  (req, res, next) => AnalysisController.analyze(req, res, next)
);

// POST /api/v1/chat/:documentId
// Ask a natural-language question about a previously analyzed policy
router.post(
  '/chat/:documentId',
  (req, res, next) => ChatController.ask(req, res, next)
);

// GET /api/v1/demo/workflow
// Return mock workflow data for product demos and onboarding
router.get('/demo/workflow', (_req, res) => {
  res.json(getDemoWorkflowPayload());
});

export default router;

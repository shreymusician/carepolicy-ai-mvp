import { Router } from 'express';
import multer from 'multer';
import AnalysisController from '../controllers/AnalysisController';

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

export default router;

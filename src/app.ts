import './env';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/mongodb';
import { errorHandler } from './middleware/errorHandler';
import analysisRoutes from './routes/analysis';
import insuranceRoutes from './routes/insurance';
import authRoutes from './routes/auth';
import AuthController from './controllers/AuthController';
import coordinatorRoutes from './routes/coordinator';
import ConfigService from './config/service';
import { setLogger, ConsoleLogger } from './utils/logger';
import {
  correlationIdMiddleware,
  requestValidationMiddleware,
  rateLimitMiddleware,
  attachTraceIdMiddleware
} from './middleware/request';

// Initialize logger
setLogger(new ConsoleLogger(ConfigService.logging.level as 'debug' | 'info' | 'warn' | 'error'));

const app = express();
const PORT = ConfigService.api.port;

// Security & Request Middleware
app.use(express.json({ limit: `${ConfigService.api.requestSizeLimitMb}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${ConfigService.api.requestSizeLimitMb}mb` }));
app.use(cookieParser());

// CORS Configuration
// Credentialed requests (auth cookies) require the actual origin to be echoed back,
// not a wildcard, so every allowed origin is reflected rather than sent as "*".
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ConfigService.api.corsOrigins[0] === '*' || ConfigService.api.corsOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Trace-ID, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request Tracking & Security
app.use(correlationIdMiddleware);
app.use(requestValidationMiddleware);
app.use(rateLimitMiddleware);
app.use(attachTraceIdMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  const traceId = (req as any).traceId || 'unknown';
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'ok',
    service: 'MyInsurance',
    version: ConfigService.api.version,
    trace_id: traceId,
    database: dbState,
    timestamp: new Date().toISOString()
  });
});

// API routes (with versioning)
app.use('/api/v1', analysisRoutes);
app.use('/api/v1', insuranceRoutes);
app.use('/api/v1', authRoutes);

// Direct demo-login endpoint to ensure demo login works in development
app.post('/api/v1/auth/demo/login', (req, res, next) => AuthController.demoLoginPolicyHolder(req, res, next));
app.use('/api/v1', coordinatorRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    const dbReady = await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`✓ MyInsurance server running on http://localhost:${PORT}`);
      console.log(`✓ Health check available at http://localhost:${PORT}/health`);
      if (!dbReady) {
        console.warn('⚠ Continuing without MongoDB persistence; API endpoints that require storage may return degraded responses');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this is the main module
if (require.main === module) {
  startServer();
}

export default app;

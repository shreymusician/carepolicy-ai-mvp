import './env';
import express from 'express';
import { connectToDatabase } from './config/mongodb';
import { errorHandler } from './middleware/errorHandler';
import analysisRoutes from './routes/analysis';
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

// CORS Configuration
app.use((req, res, next) => {
  if (ConfigService.api.corsOrigins[0] === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    const origin = req.headers.origin;
    if (origin && ConfigService.api.corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Trace-ID');

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
  res.json({
    status: 'ok',
    service: 'CarePolicy AI',
    version: ConfigService.api.version,
    trace_id: traceId,
    timestamp: new Date().toISOString()
  });
});

// API routes (with versioning)
app.use('/api/v1', analysisRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ CarePolicy AI server running on http://localhost:${PORT}`);
      console.log(`✓ Health check available at http://localhost:${PORT}/health`);
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

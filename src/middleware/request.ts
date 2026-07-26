import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import ConfigService from '../config/service';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Attach correlation ID to request for tracing
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check if correlation ID provided in header
  const traceId = req.headers['x-trace-id'] as string || `req-${randomBytes(8).toString('hex')}`;

  // Attach to request
  (req as any).traceId = traceId;

  // Attach to response header
  res.setHeader('X-Trace-ID', traceId);

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }, traceId);

  // Log response on finish
  res.on('finish', () => {
    logger.info('Response sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: Date.now()
    }, traceId);
  });

  next();
}

/**
 * Request size and type validation middleware
 */
export function requestValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const traceId = (req as any).traceId || 'unknown';

  // Check content length
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSizeBytes = ConfigService.api.requestSizeLimitMb * 1024 * 1024;

  if (contentLength > maxSizeBytes) {
    logger.warn('Request size exceeded', {
      contentLength,
      maxSize: maxSizeBytes
    }, traceId);

    res.status(413).json({
      success: false,
      error: {
        code: 'REQUEST_TOO_LARGE',
        message: `Request size exceeds ${ConfigService.api.requestSizeLimitMb}MB limit`
      },
      trace_id: traceId,
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
}

/**
 * Rate limiting middleware (simplified for MVP)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!ConfigService.security.enableRateLimit) {
    next();
    return;
  }

  const traceId = (req as any).traceId || 'unknown';
  const identifier = req.ip || 'unknown';
  const now = Date.now();
  const window = ConfigService.api.rateLimitWindowMs;
  const maxRequests = ConfigService.api.rateLimitMaxRequests;

  const current = requestCounts.get(identifier);

  if (current && now < current.resetTime) {
    current.count++;

    if (current.count > maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, count: current.count }, traceId);

      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Maximum ${maxRequests} requests per ${window}ms allowed`
        },
        trace_id: traceId,
        timestamp: new Date().toISOString()
      });
      return;
    }
  } else {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + window
    });
  }

  next();
}

/**
 * Cleanup old rate limit entries (runs every 5 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now >= value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, '_')           // Remove path separators
    .replace(/[<>:"|?*]/g, '_')       // Remove invalid characters
    .replace(/\s+/g, '_')             // Replace whitespace
    .replace(/_{2,}/g, '_')           // Replace multiple underscores
    .toLowerCase()
    .slice(0, 255);                   // Limit length
}

/**
 * Middleware to attach trace ID to response
 */
export function attachTraceIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const traceId = (req as any).traceId || 'unknown';
    return originalJson({
      ...body,
      trace_id: traceId,
      timestamp: new Date().toISOString()
    });
  };

  next();
}

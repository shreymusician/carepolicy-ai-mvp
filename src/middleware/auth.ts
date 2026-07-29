import { Request, Response, NextFunction } from 'express';
import ConfigService from '../config/service';
import AuthService from '../services/AuthService';
import { JwtPayload, UnauthorizedError, UserRole } from '../types/auth';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[ConfigService.auth.cookieName];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  return undefined;
}

/** Verifies the JWT and attaches the decoded payload to req.user. Rejects with 401 if missing/invalid. */
export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError();

    req.user = AuthService.verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Your session has expired. Please sign in again.'));
  }
}

/** Restricts a route to a specific role. Must run after requireAuth. */
export function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      next(new UnauthorizedError('You do not have access to this resource.'));
      return;
    }
    next();
  };
}

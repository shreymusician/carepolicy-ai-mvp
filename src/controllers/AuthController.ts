import { Request, Response, NextFunction, CookieOptions } from 'express';
import ConfigService from '../config/service';
import AuthService from '../services/AuthService';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthUserResponse, UnauthorizedError } from '../types/auth';

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: ConfigService.isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days; matches the default JWT_EXPIRES_IN
  };
}

function sendAuthenticated(res: Response, user: AuthUserResponse, token: string, status = 200): void {
  res.cookie(ConfigService.auth.cookieName, token, cookieOptions());
  res.status(status).json({ success: true, user });
}

export class AuthController {
  async signupPolicyHolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.signupPolicyHolder(req.body);
      sendAuthenticated(res, user, token, 201);
    } catch (error) {
      next(error);
    }
  }

  async loginPolicyHolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.loginPolicyHolder(req.body);
      sendAuthenticated(res, user, token);
    } catch (error) {
      next(error);
    }
  }

  async demoLoginPolicyHolder(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.demoLoginPolicyHolder();
      sendAuthenticated(res, user, token, 201);
    } catch (error) {
      next(error);
    }
  }

  async signupCoordinator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.signupCoordinator(req.body);
      sendAuthenticated(res, user, token, 201);
    } catch (error) {
      next(error);
    }
  }

  async loginCoordinator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.loginCoordinator(req.body);
      sendAuthenticated(res, user, token);
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(ConfigService.auth.cookieName, { path: '/' });
    res.status(200).json({ success: true });
  }

  async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      res.status(200).json({ success: true, valid: true, role: req.user.role });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      try {
        const user = await AuthService.getCurrentUser(req.user.sub, req.user.role);
        res.status(200).json({ success: true, user });
      } catch (err) {
        // If database is unavailable, fall back to returning the user info from the token
        if (err instanceof Error && (err.message.includes('MongoDB') || err.message.includes('Mongo'))) {
          const tokenUser: AuthUserResponse = {
            id: req.user.sub,
            role: req.user.role,
            name: req.user.name,
            email: req.user.email
          };
          res.status(200).json({ success: true, user: tokenUser });
          return;
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

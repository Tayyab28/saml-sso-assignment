import { Request, Response, NextFunction } from 'express';

import { SessionService } from './session.service';

export interface AuthenticatedRequest extends Request {
  user?: ReturnType<SessionService['getSession']>;
}

export function createAuthMiddleware(sessionService: SessionService) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    const user = sessionService.getSession(sessionId);

    if (!user) {
      return res.status(401).json({
        error: 'Session expired or invalid',
      });
    }

    req.user = user;
    next();
  };
}
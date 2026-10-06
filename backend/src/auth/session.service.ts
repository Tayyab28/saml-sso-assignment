import crypto from 'node:crypto';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

interface Session {
  user: AuthenticatedUser;
  expiresAt: number;
}

export class SessionService {
  private readonly sessions = new Map<string, Session>();

  createSession(user: AuthenticatedUser): string {
    const sessionId = crypto.randomBytes(32).toString('hex');

    this.sessions.set(sessionId, {
      user,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    return sessionId;
  }

  getSession(sessionId: string): AuthenticatedUser | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.user;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
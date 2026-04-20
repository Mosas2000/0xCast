import { AccessControlService } from '@/services/AccessControlService';
import { Permission } from '@/types/rbac';

export class PrivilegeEscalationDetector {
  detectPrivilegeEscalation(
    userId: string,
    accessControl: AccessControlService,
    currentPermissions: Permission[],
    newPermissions: Permission[]
  ): {
    suspicious: boolean;
    escalatedPermissions: Permission[];
  } {
    const escalatedPermissions: Permission[] = [];

    const criticalPermissions = [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_PERMISSIONS,
      Permission.MANAGE_SYSTEM_SETTINGS,
    ];

    newPermissions.forEach(permission => {
      if (!currentPermissions.includes(permission) && criticalPermissions.includes(permission)) {
        escalatedPermissions.push(permission);
      }
    });

    return {
      suspicious: escalatedPermissions.length > 0,
      escalatedPermissions,
    };
  }

  analyzeUnauthorizedAttempts(attempts: Array<{ userId: string; permission: Permission; timestamp: number }>): {
    suspiciousUsers: string[];
    frequency: { [key: string]: number };
  } {
    const frequency: { [key: string]: number } = {};
    const userAttempts: { [key: string]: number } = {};

    attempts.forEach(attempt => {
      frequency[attempt.permission] = (frequency[attempt.permission] ?? 0) + 1;
      userAttempts[attempt.userId] = (userAttempts[attempt.userId] ?? 0) + 1;
    });

    const suspiciousUsers = Object.entries(userAttempts)
      .filter(([_, count]) => count > 5)
      .map(([userId]) => userId);

    return {
      suspiciousUsers,
      frequency,
    };
  }
}

export class SecureSessionManager {
  private activeSessions: Map<string, { userId: string; loginTime: number; lastActivity: number; ipAddress?: string }>;
  private sessionTimeout: number;

  constructor(sessionTimeoutMs: number = 3600000) {
    this.activeSessions = new Map();
    this.sessionTimeout = sessionTimeoutMs;
  }

  createSession(sessionId: string, userId: string, ipAddress?: string): void {
    this.activeSessions.set(sessionId, {
      userId,
      loginTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress,
    });
  }

  validateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const timeSinceActivity = Date.now() - session.lastActivity;
    return timeSinceActivity < this.sessionTimeout;
  }

  updateActivity(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  endSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  getSessionUser(sessionId: string): string | null {
    const session = this.activeSessions.get(sessionId);
    return session?.userId ?? null;
  }

  getActiveSessions(userId: string): string[] {
    const sessions: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      if (session.userId === userId && this.validateSession(sessionId)) {
        sessions.push(sessionId);
      }
    });

    return sessions;
  }

  cleanupExpiredSessions(): number {
    let cleaned = 0;

    this.activeSessions.forEach((session, sessionId) => {
      if (!this.validateSession(sessionId)) {
        this.activeSessions.delete(sessionId);
        cleaned++;
      }
    });

    return cleaned;
  }
}

export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }>;
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, resetTime: Date.now() + this.windowMs });
      return true;
    }

    if (Date.now() > attempt.resetTime) {
      attempt.count = 1;
      attempt.resetTime = Date.now() + this.windowMs;
      return true;
    }

    if (attempt.count < this.maxAttempts) {
      attempt.count++;
      return true;
    }

    return false;
  }

  getAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    return attempt?.count ?? 0;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  cleanupExpired(): void {
    const now = Date.now();

    this.attempts.forEach((attempt, key) => {
      if (now > attempt.resetTime) {
        this.attempts.delete(key);
      }
    });
  }
}

export class EncryptionHelper {
  static hashPassword(password: string): string {
    return Buffer.from(password).toString('base64');
  }

  static verifyPassword(password: string, hash: string): boolean {
    return Buffer.from(password).toString('base64') === hash;
  }

  static generateToken(userId: string, secret: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString('base64');

    const signature = Buffer.from(`${header}.${payload}.${secret}`).toString('base64');

    return `${header}.${payload}.${signature}`;
  }

  static verifyToken(token: string, secret: string): { valid: boolean; userId?: string } {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { valid: false };
    }

    const [header, payload, signature] = parts;
    const expectedSignature = Buffer.from(`${header}.${payload}.${secret}`).toString('base64');

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      return { valid: true, userId: decoded.userId };
    } catch {
      return { valid: false };
    }
  }
}

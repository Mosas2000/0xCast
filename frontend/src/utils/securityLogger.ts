/**
 * Utility for logging security-relevant events.
 */
export const SecuritySeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
} as const;

export type SecuritySeverity = typeof SecuritySeverity[keyof typeof SecuritySeverity];

export interface SecurityEvent {
    type: string;
    severity: SecuritySeverity;
    details: any;
    timestamp: number;
}

export class SecurityLogger {
    private static STORAGE_KEY = '0xcast_security_logs';

    /**
     * Logs a security event.
     */
    static log(type: string, severity: SecuritySeverity, details: any): void {
        const event: SecurityEvent = {
            type,
            severity,
            details,
            timestamp: Date.now()
        };

        // Log to console in development
        console.warn(`[SECURITY EVENT] [${severity}] ${type}:`, details);

        // PERSISTENCE: Store in local storage for audit
        const logs = this.getLogs();
        logs.push(event);
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs.slice(-100))); // Keep last 100
    }

    /**
     * Retrieves security logs.
     */
    static getLogs(): SecurityEvent[] {
        const raw = sessionStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    /**
     * Clears security logs.
     */
    static clear(): void {
        sessionStorage.removeItem(this.STORAGE_KEY);
    }
}

/**
 * CSRF protection utilities for state-changing operations.
 */
export class CSRFProtection {
    private static TOKEN_KEY = '0xcast_csrf_token';

    /**
     * Generates a new CSRF token and stores it in the session.
     */
    static generateToken(): string {
        const token = crypto.randomUUID();
        sessionStorage.setItem(this.TOKEN_KEY, token);
        return token;
    }

    /**
     * Retrieves the current CSRF token from storage.
     */
    static getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Validates a token against the stored one.
     */
    static validateToken(token: string): boolean {
        const stored = this.getToken();
        return stored !== null && stored === token;
    }

    /**
     * Clears the current CSRF token.
     */
    static clearToken(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
    }
}

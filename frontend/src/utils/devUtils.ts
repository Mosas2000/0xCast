/**
 * Developer utilities for debugging and state inspection.
 */
export class DevUtils {
    private static DEBUG_MODE = process.env.NODE_ENV === 'development';

    /**
     * Logs a message only in development mode.
     */
    static log(...args: any[]): void {
        if (this.DEBUG_MODE) {
            console.log('[DEV]', ...args);
        }
    }

    /**
     * Dumps the current application state to the console.
     */
    static dumpState(name: string, state: any): void {
        if (this.DEBUG_MODE) {
            console.group(`[DEV STATE DUMP] ${name}`);
            console.table(state);
            console.groupEnd();
        }
    }

    /**
     * Simulates a network delay for testing loading states.
     */
    static simulateDelay(ms: number = 1000): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Simulates a random error for testing error boundaries.
     */
    static throwRandomError(probability: number = 0.5): void {
        if (Math.random() < probability) {
            throw new Error('Simulated developer error');
        }
    }
}

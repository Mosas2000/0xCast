/**
 * Error code to human-readable message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
    // Market errors
    'u101': 'Market not found',
    'u102': 'Market has already ended',
    'u103': 'Market is not yet resolved',
    'u104': 'Only the market creator can resolve this market',
    'u105': 'Invalid outcome selected',
    'u106': 'Stake amount is too low',
    'u107': 'Market trading has ended',
    'u108': 'Winnings already claimed',
    'u109': 'No winnings to claim',
    'u110': 'Market must be resolved before claiming',

    // General errors
    'insufficient-balance': 'Insufficient STX balance',
    'user-cancelled': 'Transaction cancelled by user',
    'network-error': 'Network connection error',
};

/**
 * Parse contract error and return human-readable message
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export function parseContractError(error: unknown): string {
    if (!error) return 'An unknown error occurred';

    // Handle string errors
    if (typeof error === 'string') {
        // Check if it's an error code
        if (ERROR_MESSAGES[error]) {
            return ERROR_MESSAGES[error];
        }
        return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
        const message = error.message;

        // Try to extract error code from message
        const errorCodeMatch = message.match(/\(err u(\d+)\)/);
        if (errorCodeMatch) {
            const errorCode = `u${errorCodeMatch[1]}`;
            if (ERROR_MESSAGES[errorCode]) {
                return ERROR_MESSAGES[errorCode];
            }
        }

        // Check for known error patterns
        if (message.includes('insufficient')) {
            return ERROR_MESSAGES['insufficient-balance'];
        }
        if (message.includes('cancelled') || message.includes('canceled')) {
            return ERROR_MESSAGES['user-cancelled'];
        }
        if (message.includes('network') || message.includes('fetch')) {
            return ERROR_MESSAGES['network-error'];
        }

        return message;
    }

    return 'An unexpected error occurred';
}

/**
 * Get error severity level
 * @param error - Error message or code
 * @returns Severity level: 'error' | 'warning' | 'info'
 */
export function getErrorSeverity(error: string): 'error' | 'warning' | 'info' {
    if (error.includes('cancelled') || error.includes('canceled')) {
        return 'info';
    }
    if (error.includes('already') || error.includes('not yet')) {
        return 'warning';
    }
    return 'error';
}

/**
 * Validate Stacks address format
 * @param address - Stacks address to validate
 * @returns True if valid Stacks address
 */
export function isValidSTXAddress(address: string): boolean {
    // Stacks addresses start with SP or SM for mainnet, ST for testnet
    const stacksAddressRegex = /^(SP|SM|ST)[0-9A-Z]{38,41}$/;
    return stacksAddressRegex.test(address);
}

/**
 * Validate stake amount
 * @param amount - Amount to validate
 * @param min - Minimum allowed amount (default: 0.000001)
 * @param max - Maximum allowed amount (default: Infinity)
 * @returns Object with isValid and error message
 */
export function isValidAmount(
    amount: number,
    min: number = 0.000001,
    max: number = Infinity
): { isValid: boolean; error?: string } {
    if (isNaN(amount) || amount <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' };
    }
    if (amount < min) {
        return { isValid: false, error: `Amount must be at least ${min}` };
    }
    if (amount > max) {
        return { isValid: false, error: `Amount cannot exceed ${max}` };
    }
    return { isValid: true };
}

/**
 * Validate market question text
 * @param text - Question text to validate
 * @param minLength - Minimum length (default: 10)
 * @param maxLength - Maximum length (default: 200)
 * @returns Object with isValid and error message
 */
export function isValidQuestion(
    text: string,
    minLength: number = 10,
    maxLength: number = 200
): { isValid: boolean; error?: string } {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
        return { isValid: false, error: 'Question cannot be empty' };
    }
    if (trimmed.length < minLength) {
        return { isValid: false, error: `Question must be at least ${minLength} characters` };
    }
    if (trimmed.length > maxLength) {
        return { isValid: false, error: `Question cannot exceed ${maxLength} characters` };
    }
    if (!trimmed.endsWith('?')) {
        return { isValid: false, error: 'Question should end with a question mark' };
    }

    return { isValid: true };
}

/**
 * Validate date is in the future
 * @param date - Date to validate
 * @param minFutureMs - Minimum time in future (default: 1 hour)
 * @returns Object with isValid and error message
 */
export function isValidDate(
    date: Date,
    minFutureMs: number = 3600000 // 1 hour
): { isValid: boolean; error?: string } {
    const now = Date.now();
    const timestamp = date.getTime();

    if (isNaN(timestamp)) {
        return { isValid: false, error: 'Invalid date' };
    }
    if (timestamp <= now) {
        return { isValid: false, error: 'Date must be in the future' };
    }
    if (timestamp < now + minFutureMs) {
        return { isValid: false, error: 'Date must be at least 1 hour in the future' };
    }

    return { isValid: true };
}

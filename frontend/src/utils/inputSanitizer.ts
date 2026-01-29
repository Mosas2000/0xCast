/**
 * Simple input sanitization utility for XSS prevention.
 */
export class InputSanitizer {
    /**
     * Sanitizes a string by escaping HTML special characters.
     */
    static sanitize(input: string): string {
        if (!input) return '';

        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Truncates a string to a maximum length and sanitizes it.
     */
    static sanitizeAndTruncate(input: string, maxLength: number): string {
        const truncated = input.length > maxLength ? input.substring(0, maxLength) : input;
        return this.sanitize(truncated);
    }

    /**
     * Strips all HTML tags from a string.
     */
    static stripTags(input: string): string {
        return input.replace(/<[^>]*>?/gm, '');
    }
}

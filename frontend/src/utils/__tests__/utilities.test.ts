import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../inputSanitizer';
import { RateLimiter } from '../rateLimiter';

/**
 * Unit tests for security and performance utilities.
 */
describe('Utility Functions', () => {
    describe('InputSanitizer', () => {
        it('should escape HTML characters', () => {
            const input = '<script>alert("xss")</script>';
            const sanitized = InputSanitizer.sanitize(input);
            expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });

        it('should strip HTML tags', () => {
            const input = '<b>Hello</b> <i>World</i>';
            const stripped = InputSanitizer.stripTags(input);
            expect(stripped).toBe('Hello World');
        });
    });

    describe('RateLimiter', () => {
        it('should allow requests within limit', () => {
            const limiter = new RateLimiter();
            const key = 'test-key';
            expect(limiter.isAllowed(key, 2, 1000)).toBe(true);
            expect(limiter.isAllowed(key, 2, 1000)).toBe(true);
            expect(limiter.isAllowed(key, 2, 1000)).toBe(false);
        });
    });
});

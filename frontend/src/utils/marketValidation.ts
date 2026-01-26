import type { Market } from '../types/market';

interface ValidationResult {
    isValid: boolean;
    message: string;
}

/**
 * Validate market question
 * @param text - Question text
 * @returns Validation result
 */
export function validateQuestion(text: string): ValidationResult {
    if (!text || text.trim().length === 0) {
        return { isValid: false, message: 'Question is required' };
    }

    if (text.length < 10) {
        return { isValid: false, message: 'Question must be at least 10 characters' };
    }

    if (text.length > 256) {
        return { isValid: false, message: 'Question must be 256 characters or less' };
    }

    if (!text.endsWith('?')) {
        return { isValid: false, message: 'Question should end with a question mark' };
    }

    // Check for clarity
    const hasMultipleQuestions = (text.match(/\?/g) || []).length > 1;
    if (hasMultipleQuestions) {
        return { isValid: false, message: 'Question should be a single, clear question' };
    }

    return { isValid: true, message: 'Question is valid' };
}

/**
 * Validate market dates
 * @param endDate - End date
 * @param resolutionDate - Resolution date
 * @returns Validation result
 */
export function validateDates(endDate: Date, resolutionDate: Date): ValidationResult {
    const now = new Date();

    if (endDate <= now) {
        return { isValid: false, message: 'End date must be in the future' };
    }

    if (resolutionDate <= endDate) {
        return { isValid: false, message: 'Resolution date must be after end date' };
    }

    const daysBetween = (resolutionDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysBetween < 1) {
        return { isValid: false, message: 'Resolution date should be at least 1 day after end date' };
    }

    return { isValid: true, message: 'Dates are valid' };
}

/**
 * Suggest improvements for market creation
 * @param formData - Market form data
 * @returns Array of suggestions
 */
export function suggestImprovements(formData: {
    question: string;
    endDate: string;
    resolutionDate: string;
}): string[] {
    const suggestions: string[] = [];

    // Question improvements
    if (formData.question) {
        if (formData.question.toLowerCase().includes('will')) {
            // Good - already uses "will"
        } else {
            suggestions.push('Consider rephrasing as "Will [event] happen?" for clarity');
        }

        if (formData.question.length < 30) {
            suggestions.push('Add more context to make the question clearer');
        }
    }

    // Date improvements
    if (formData.endDate && formData.resolutionDate) {
        const endDate = new Date(formData.endDate);
        const resolutionDate = new Date(formData.resolutionDate);
        const daysBetween = (resolutionDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysBetween < 2) {
            suggestions.push('Consider allowing more time between end and resolution dates');
        }
    }

    return suggestions;
}

/**
 * Check if market question is duplicate or very similar
 * @param question - New question
 * @param markets - Existing markets
 * @returns True if duplicate found
 */
export function isMarketDuplicate(question: string, markets: Market[]): boolean {
    const normalizedQuestion = question.toLowerCase().trim();

    return markets.some((market) => {
        const normalizedExisting = market.question.toLowerCase().trim();

        // Exact match
        if (normalizedQuestion === normalizedExisting) {
            return true;
        }

        // Very similar (simple similarity check)
        const similarity = calculateSimilarity(normalizedQuestion, normalizedExisting);
        return similarity > 0.8;
    });
}

/**
 * Calculate simple string similarity
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);

    return commonWords.length / totalWords;
}

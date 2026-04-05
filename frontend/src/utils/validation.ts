/**
 * Input Validation Utilities
 * 
 * Provides validation functions for user inputs throughout the application.
 * All validators return an object with isValid boolean and optional error message.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Constants for validation
export const VALIDATION_LIMITS = {
  MIN_STAKE_AMOUNT: 1,
  MAX_STAKE_AMOUNT: 1000000,
  MIN_MARKET_QUESTION_LENGTH: 10,
  MAX_MARKET_QUESTION_LENGTH: 500,
  STACKS_ADDRESS_LENGTH: 41,
  MEMO_MAX_LENGTH: 34,
} as const;

/**
 * Validate a stake/trade amount
 */
export function validateAmount(
  amount: string | number,
  min: number = VALIDATION_LIMITS.MIN_STAKE_AMOUNT,
  max: number = VALIDATION_LIMITS.MAX_STAKE_AMOUNT
): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (numAmount < min) {
    return { isValid: false, error: `Minimum amount is ${min} STX` };
  }

  if (numAmount > max) {
    return { isValid: false, error: `Maximum amount is ${max} STX` };
  }

  // Check for excessive decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 6) {
    return { isValid: false, error: 'Maximum 6 decimal places allowed' };
  }

  return { isValid: true };
}

/**
 * Validate a Stacks wallet address
 */
export function validateStacksAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Address is required' };
  }

  const trimmedAddress = address.trim();

  // Check prefix (SP for mainnet, ST for testnet)
  if (!trimmedAddress.startsWith('SP') && !trimmedAddress.startsWith('ST')) {
    return { isValid: false, error: 'Invalid address format. Must start with SP or ST' };
  }

  // Check length
  if (trimmedAddress.length !== VALIDATION_LIMITS.STACKS_ADDRESS_LENGTH) {
    return { isValid: false, error: `Address must be ${VALIDATION_LIMITS.STACKS_ADDRESS_LENGTH} characters` };
  }

  // Check for valid characters (Base58 characters minus 0, O, I, l)
  const validChars = /^[S][PT][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  if (!validChars.test(trimmedAddress)) {
    return { isValid: false, error: 'Address contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate a market question
 */
export function validateMarketQuestion(question: string): ValidationResult {
  if (!question || question.trim().length === 0) {
    return { isValid: false, error: 'Question is required' };
  }

  const trimmedQuestion = question.trim();

  if (trimmedQuestion.length < VALIDATION_LIMITS.MIN_MARKET_QUESTION_LENGTH) {
    return { isValid: false, error: `Question must be at least ${VALIDATION_LIMITS.MIN_MARKET_QUESTION_LENGTH} characters` };
  }

  if (trimmedQuestion.length > VALIDATION_LIMITS.MAX_MARKET_QUESTION_LENGTH) {
    return { isValid: false, error: `Question must be less than ${VALIDATION_LIMITS.MAX_MARKET_QUESTION_LENGTH} characters` };
  }

  // Check for minimum word count
  const wordCount = trimmedQuestion.split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 3) {
    return { isValid: false, error: 'Question must contain at least 3 words' };
  }

  return { isValid: true };
}

/**
 * Validate a memo string for transfers
 */
export function validateMemo(memo: string): ValidationResult {
  if (!memo) {
    return { isValid: true }; // Memo is optional
  }

  const byteLength = new TextEncoder().encode(memo).length;
  
  if (byteLength > VALIDATION_LIMITS.MEMO_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Memo exceeds ${VALIDATION_LIMITS.MEMO_MAX_LENGTH} bytes (${byteLength} bytes used)` 
    };
  }

  return { isValid: true };
}

/**
 * Sanitize a string input by removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Convert HTML entities
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return html.replace(/[&<>"'`=/]/g, (char) => entities[char] || char);
}

/**
 * Validate a market ID
 */
export function validateMarketId(id: string | number): ValidationResult {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;

  if (isNaN(numId)) {
    return { isValid: false, error: 'Invalid market ID' };
  }

  if (numId < 0) {
    return { isValid: false, error: 'Market ID cannot be negative' };
  }

  if (!Number.isInteger(numId)) {
    return { isValid: false, error: 'Market ID must be a whole number' };
  }

  return { isValid: true };
}

/**
 * Validate URL to prevent open redirect vulnerabilities
 */
export function validateUrl(url: string, allowedDomains?: string[]): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Block javascript: and data: protocols
    if (parsedUrl.protocol === 'javascript:' || parsedUrl.protocol === 'data:') {
      return { isValid: false, error: 'Invalid URL protocol' };
    }
    
    // If allowedDomains specified, check domain whitelist
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return { isValid: false, error: 'URL domain not allowed' };
      }
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

export default {
  validateAmount,
  validateStacksAddress,
  validateMarketQuestion,
  validateMemo,
  validateMarketId,
  validateUrl,
  sanitizeInput,
  sanitizeHtml,
  VALIDATION_LIMITS,
};

/**
 * Market Validation Utilities
 * 
 * Utility functions for validating and formatting market creation data.
 * 
 * Validation Rules:
 * - Question: 10-256 characters, must end with "?"
 * - Category: Required selection
 * - Duration: 144-525,600 blocks (~1 day to ~1 year)
 * 
 * Block Time Calculations:
 * - 1 block ≈ 10 minutes
 * - 6 blocks ≈ 1 hour
 * - 144 blocks ≈ 1 day
 * - 1,008 blocks ≈ 1 week
 * 
 * @module marketValidation
 */

import type { CreateMarketFormData, MarketValidationResult } from '../types/market';

/** Minimum question length for valid markets */
const MIN_QUESTION_LENGTH = 10;

/** Maximum question length for valid markets */
const MAX_QUESTION_LENGTH = 256;

/** Minimum duration in blocks (~1 day) */
const MIN_DURATION_BLOCKS = 144;

/** Maximum duration in blocks (~1 year) */
const MAX_DURATION_BLOCKS = 525600;

/**
 * Validate market creation form data
 */
export function validateMarketForm(data: CreateMarketFormData): MarketValidationResult {
  const errors: MarketValidationResult['errors'] = {};
  
  // Validate question
  if (!data.question || data.question.trim().length === 0) {
    errors.question = 'Question is required';
  } else if (data.question.trim().length < MIN_QUESTION_LENGTH) {
    errors.question = `Question must be at least ${MIN_QUESTION_LENGTH} characters`;
  } else if (data.question.length > MAX_QUESTION_LENGTH) {
    errors.question = `Question must not exceed ${MAX_QUESTION_LENGTH} characters`;
  } else if (!data.question.endsWith('?')) {
    errors.question = 'Question must end with a question mark (?)';
  }
  
  // Validate category
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  // Validate duration
  if (!data.durationBlocks || data.durationBlocks <= 0) {
    errors.duration = 'Duration is required';
  } else if (data.durationBlocks < MIN_DURATION_BLOCKS) {
    errors.duration = `Duration must be at least ${MIN_DURATION_BLOCKS} blocks (~1 day)`;
  } else if (data.durationBlocks > MAX_DURATION_BLOCKS) {
    errors.duration = `Duration must not exceed ${MAX_DURATION_BLOCKS} blocks (~1 year)`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format blocks to human-readable time
 */
export function formatBlocksToTime(blocks: number): string {
  const days = Math.floor(blocks / 144);
  const hours = Math.floor((blocks % 144) / 6);
  
  if (days === 0 && hours === 0) {
    return `${blocks} blocks`;
  }
  
  if (days === 0) {
    return `~${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  if (hours === 0) {
    return `~${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return `~${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
}

/**
 * Convert time to blocks (approximation)
 */
export function timeToBlocks(days: number, hours: number = 0): number {
  return Math.floor(days * 144 + hours * 6);
}

/**
 * Check if question might be a duplicate (simple string similarity)
 */
export function checkDuplicateQuestion(
  question: string,
  existingQuestions: string[]
): boolean {
  const normalized = question.toLowerCase().trim();
  
  return existingQuestions.some(existing => {
    const existingNormalized = existing.toLowerCase().trim();
    return existingNormalized === normalized;
  });
}

/**
 * Suggest improvements to question format
 */
export function suggestQuestionImprovements(question: string): string[] {
  const suggestions: string[] = [];
  
  if (!question.trim()) {
    return ['Enter a question to get suggestions'];
  }
  
  if (!question.endsWith('?')) {
    suggestions.push('Add a question mark (?) at the end');
  }
  
  if (question.split(' ').length < 3) {
    suggestions.push('Make the question more descriptive');
  }
  
  if (question.length < MIN_QUESTION_LENGTH) {
    suggestions.push(`Add at least ${MIN_QUESTION_LENGTH - question.length} more characters`);
  }
  
  // Check for yes/no format
  const yesNoStarters = ['will', 'can', 'does', 'is', 'are', 'has', 'have'];
  const startsWithYesNo = yesNoStarters.some(starter => 
    question.toLowerCase().startsWith(starter)
  );
  
  if (!startsWithYesNo && suggestions.length === 0) {
    suggestions.push('Consider starting with "Will", "Can", "Does", etc. for clarity');
  }
  
  return suggestions.length > 0 ? suggestions : ['Question looks good! ✓'];
}

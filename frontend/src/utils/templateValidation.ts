import type { TemplateValidationRule, ValidationState } from '../types/template';
import { QUESTION_VALIDATION_RULES } from '../types/template';

export const validateQuestion = (question: string): { valid: boolean; errors: string[]; suggestions: string[] } => {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!question || question.trim().length === 0) {
    errors.push('Question is required');
    return { valid: false, errors, suggestions };
  }

  QUESTION_VALIDATION_RULES.forEach(rule => {
    if (!rule.validator(question.trim())) {
      if (rule.rule === 'notStartsWithWill') {
        suggestions.push(rule.message);
      } else {
        errors.push(rule.message);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    suggestions,
  };
};

export const validateDuration = (duration: number): { valid: boolean; error: string | null } => {
  if (!duration || duration <= 0) {
    return { valid: false, error: 'Duration must be greater than 0' };
  }

  if (duration < 144) {
    return { valid: false, error: 'Duration must be at least 1 day (144 blocks)' };
  }

  if (duration > 52560) {
    return { valid: false, error: 'Duration cannot exceed 1 year (52,560 blocks)' };
  }

  return { valid: true, error: null };
};

export const validateCategory = (category: string): { valid: boolean; error: string | null } => {
  if (!category || category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }

  const validCategories = ['crypto', 'sports', 'politics', 'economics', 'technology', 'entertainment', 'other'];
  if (!validCategories.includes(category.toLowerCase())) {
    return { valid: false, error: 'Invalid category selected' };
  }

  return { valid: true, error: null };
};

export const validateMarketForm = (
  question: string,
  duration: number,
  category: string
): ValidationState => {
  const questionValidation = validateQuestion(question);
  const durationValidation = validateDuration(duration);
  const categoryValidation = validateCategory(category);

  return {
    question: {
      valid: questionValidation.valid,
      error: questionValidation.errors.length > 0 ? questionValidation.errors[0] : null,
      suggestion: questionValidation.suggestions.length > 0 ? questionValidation.suggestions[0] : null,
    },
    duration: {
      valid: durationValidation.valid,
      error: durationValidation.error,
    },
    category: {
      valid: categoryValidation.valid,
      error: categoryValidation.error,
    },
  };
};

export const getQuestionSuggestions = (question: string): string[] => {
  const suggestions: string[] = [];

  if (question.length < 20) {
    suggestions.push('Your question is quite short. Consider adding more detail for clarity.');
  }

  if (question.length > 400) {
    suggestions.push('Your question is very long. Consider breaking it into multiple shorter markets.');
  }

  if (!question.includes('?')) {
    suggestions.push('Consider ending your question with a question mark.');
  }

  const dateKeywords = ['today', 'tomorrow', 'next week', 'next month', 'next year', 'end of', 'by', 'before', 'after'];
  if (!dateKeywords.some(keyword => question.toLowerCase().includes(keyword))) {
    suggestions.push('Your question may benefit from a specific date or timeframe.');
  }

  const negativeKeywords = ['bad', 'worst', 'terrible', 'awful'];
  if (negativeKeywords.some(keyword => question.toLowerCase().includes(keyword))) {
    suggestions.push('Consider using more neutral language for objective verification.');
  }

  return suggestions;
};

export const formatDurationLabel = (blocks: number): string => {
  const hoursPerBlock = 10 / 60;
  const hours = blocks * hoursPerBlock;

  if (hours < 24) {
    return `${Math.round(hours)} hours`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} days`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} weeks`;
  }

  const months = Math.floor(days / 30);
  return `${months} months`;
};

export const calculateEndDate = (blocks: number): Date => {
  const minutesPerBlock = 10;
  const ms = blocks * minutesPerBlock * 60 * 1000;
  return new Date(Date.now() + ms);
};

export const formatEndDate = (blocks: number): string => {
  const endDate = calculateEndDate(blocks);
  return endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getResolutionDate = (blocks: number): Date => {
  const minutesPerBlock = 10;
  const ms = blocks * minutesPerBlock * 60 * 1000;
  const endDate = new Date(Date.now() + ms);
  const buffer = 7 * 24 * 60 * 60 * 1000;
  return new Date(endDate.getTime() + buffer);
};

export const formatResolutionDate = (blocks: number): string => {
  const resolutionDate = getResolutionDate(blocks);
  return resolutionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isValidQuestion = (question: string): boolean => {
  return validateQuestion(question).valid;
};

export const isValidDuration = (duration: number): boolean => {
  return validateDuration(duration).valid;
};

export const isValidCategory = (category: string): boolean => {
  return validateCategory(category).valid;
};

export const isFormValid = (question: string, duration: number, category: string): boolean => {
  return isValidQuestion(question) && isValidDuration(duration) && isValidCategory(category);
};

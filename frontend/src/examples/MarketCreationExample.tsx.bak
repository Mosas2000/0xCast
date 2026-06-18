/**
 * Market Creation Example Component
 * 
 * Demonstrates best practices for creating a prediction market using:
 * - useContract hook for blockchain interactions
 * - Market validation utilities
 * - Type-safe enums
 * - Proper error handling
 * - User feedback with toast notifications
 * 
 * This is a reference implementation showing how to properly integrate
 * all the utilities and hooks for market creation.
 */

import { useState, FormEvent } from 'react';
import { useContract } from '@/hooks/useContract';
import {
  validateMarketCreation,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_MARKET_DURATION_BLOCKS,
  MAX_MARKET_DURATION_BLOCKS,
} from '@/utils/marketValidation';

interface FormErrors {
  title?: string;
  description?: string;
  duration?: string;
}

export function MarketCreationExample() {
  const { createMarket, isConnected } = useContract();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationBlocks, setDurationBlocks] = useState(144); // Default: ~1 day
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form inputs and display errors
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate complete market data
    const result = validateMarketCreation({
      title,
      description,
      durationBlocks,
    });

    if (!result.isValid) {
      // Map validation result to form errors
      if (result.field) {
        newErrors[result.field as keyof FormErrors] = result.error;
      }
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check wallet connection
    if (!isConnected) {
      alert('Please connect your wallet to create a market');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create market on blockchain
      await createMarket(title, durationBlocks);
      
      // Success feedback
      alert('Market created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDurationBlocks(144);
      setErrors({});
    } catch (error) {
      // Error is already logged by useContract
      alert('Failed to create market. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculate approximate duration in human-readable format
   */
  const getApproximateDuration = (blocks: number): string => {
    const hours = Math.floor(blocks / 6);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `~${days} day${days > 1 ? 's' : ''}`;
    }
    return `~${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="market-creation-form">
      <h2>Create Prediction Market</h2>
      
      {!isConnected && (
        <div className="warning">
          Please connect your wallet to create a market
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title">
            Market Question *
            <span className="char-count">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Will Bitcoin reach $100,000 by end of 2026?"
            minLength={MIN_TITLE_LENGTH}
            maxLength={MAX_TITLE_LENGTH}
            required
            disabled={isSubmitting}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <span id="title-error" className="error" role="alert">
              {errors.title}
            </span>
          )}
          <span className="hint">
            Minimum {MIN_TITLE_LENGTH} characters, maximum {MAX_TITLE_LENGTH} characters
          </span>
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label htmlFor="description">
            Market Description *
            <span className="char-count">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the market resolution criteria..."
            minLength={MIN_DESCRIPTION_LENGTH}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={5}
            required
            disabled={isSubmitting}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <span id="description-error" className="error" role="alert">
              {errors.description}
            </span>
          )}
          <span className="hint">
            Minimum {MIN_DESCRIPTION_LENGTH} characters, maximum {MAX_DESCRIPTION_LENGTH} characters
          </span>
        </div>

        {/* Duration Input */}
        <div className="form-group">
          <label htmlFor="duration">
            Market Duration (blocks) *
            <span className="duration-hint">
              {getApproximateDuration(durationBlocks)}
            </span>
          </label>
          <input
            id="duration"
            type="number"
            value={durationBlocks}
            onChange={(e) => setDurationBlocks(parseInt(e.target.value, 10))}
            min={MIN_MARKET_DURATION_BLOCKS}
            max={MAX_MARKET_DURATION_BLOCKS}
            required
            disabled={isSubmitting}
            aria-invalid={!!errors.duration}
            aria-describedby={errors.duration ? 'duration-error' : undefined}
          />
          {errors.duration && (
            <span id="duration-error" className="error" role="alert">
              {errors.duration}
            </span>
          )}
          <span className="hint">
            Minimum {MIN_MARKET_DURATION_BLOCKS} blocks (~1 hour), 
            maximum {MAX_MARKET_DURATION_BLOCKS} blocks (~1 year)
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Market...' : 'Create Market'}
        </button>
      </form>

      {/* Information Section */}
      <div className="info-section">
        <h3>Market Creation Guidelines</h3>
        <ul>
          <li>Market questions should be clear and unambiguous</li>
          <li>Resolution criteria must be objective and verifiable</li>
          <li>Choose an appropriate duration for your market</li>
          <li>Ensure you have sufficient STX for transaction fees</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example CSS (for reference)
 * 
 * .market-creation-form {
 *   max-width: 600px;
 *   margin: 0 auto;
 *   padding: 2rem;
 * }
 * 
 * .form-group {
 *   margin-bottom: 1.5rem;
 * }
 * 
 * .form-group label {
 *   display: flex;
 *   justify-content: space-between;
 *   margin-bottom: 0.5rem;
 *   font-weight: 600;
 * }
 * 
 * .char-count {
 *   font-size: 0.875rem;
 *   color: #666;
 *   font-weight: normal;
 * }
 * 
 * .form-group input,
 * .form-group textarea {
 *   width: 100%;
 *   padding: 0.75rem;
 *   border: 1px solid #ddd;
 *   border-radius: 4px;
 *   font-size: 1rem;
 * }
 * 
 * .form-group input[aria-invalid="true"],
 * .form-group textarea[aria-invalid="true"] {
 *   border-color: #dc3545;
 * }
 * 
 * .error {
 *   display: block;
 *   color: #dc3545;
 *   font-size: 0.875rem;
 *   margin-top: 0.25rem;
 * }
 * 
 * .hint {
 *   display: block;
 *   color: #666;
 *   font-size: 0.875rem;
 *   margin-top: 0.25rem;
 * }
 * 
 * .warning {
 *   padding: 1rem;
 *   background-color: #fff3cd;
 *   border: 1px solid #ffc107;
 *   border-radius: 4px;
 *   margin-bottom: 1rem;
 * }
 * 
 * .submit-button {
 *   width: 100%;
 *   padding: 1rem;
 *   background-color: #007bff;
 *   color: white;
 *   border: none;
 *   border-radius: 4px;
 *   font-size: 1rem;
 *   font-weight: 600;
 *   cursor: pointer;
 * }
 * 
 * .submit-button:hover:not(:disabled) {
 *   background-color: #0056b3;
 * }
 * 
 * .submit-button:disabled {
 *   background-color: #6c757d;
 *   cursor: not-allowed;
 * }
 * 
 * .info-section {
 *   margin-top: 2rem;
 *   padding: 1rem;
 *   background-color: #f8f9fa;
 *   border-radius: 4px;
 * }
 */

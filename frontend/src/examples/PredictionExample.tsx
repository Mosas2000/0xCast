/**
 * Prediction Placement Example Component
 * 
 * Demonstrates best practices for placing predictions on markets using:
 * - useContract hook with BigInt handling
 * - Market validation utilities
 * - Type-safe MarketOutcome enum
 * - Amount parsing and formatting
 * - Proper error handling
 * - User feedback
 * 
 * This is a reference implementation showing how to properly handle
 * predictions with BigInt amounts and validation.
 */

import { useState, FormEvent, useMemo } from 'react';
import {
  useContract,
  parseToMicroAmount,
  formatMicroAmount,
  validateTransactionAmount,
} from '../hooks/useContract';
import { validatePrediction } from '../utils/marketValidation';
import { MarketOutcome, getMarketOutcomeLabel } from '../types/market';
import type { Market } from '../types/market';

interface PredictionExampleProps {
  market: Market;
  onSuccess?: () => void;
}

export function PredictionExample({ market, onSuccess }: PredictionExampleProps) {
  const { predict, isConnected, address } = useContract();
  
  // Form state
  const [outcome, setOutcome] = useState<MarketOutcome>(MarketOutcome.YES);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parse and validate amount
   */
  const amountValidation = useMemo(() => {
    if (!amountInput) {
      return { isValid: false, error: 'Amount is required' };
    }

    try {
      const amountMicroStx = parseToMicroAmount(amountInput);
      
      // Validate amount is within safe range
      const txValidation = validateTransactionAmount(amountMicroStx);
      if (!txValidation.isValid) {
        return txValidation;
      }

      // Validate prediction data
      const predictionValidation = validatePrediction({
        marketId: market.id,
        outcome,
        amount: amountMicroStx,
      });

      return predictionValidation;
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid amount format',
      };
    }
  }, [amountInput, market.id, outcome]);

  /**
   * Calculate potential shares (simplified example)
   */
  const potentialShares = useMemo(() => {
    if (!amountValidation.isValid) return null;

    try {
      const amountMicroStx = parseToMicroAmount(amountInput);
      // Simplified calculation - actual calculation would use AMM formula
      const shares = amountMicroStx / BigInt(market.currentPrice * 1_000_000);
      return formatMicroAmount(shares);
    } catch {
      return null;
    }
  }, [amountInput, market.currentPrice, amountValidation.isValid]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check wallet connection
    if (!isConnected || !address) {
      setError('Please connect your wallet to place a prediction');
      return;
    }

    // Validate form
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Invalid prediction data');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse amount to BigInt
      const amountMicroStx = parseToMicroAmount(amountInput);

      // Convert market ID to number
      const marketIdNum = parseInt(market.id, 10);

      // Determine outcome string
      const outcomeStr = outcome === MarketOutcome.YES ? 'yes' : 'no';

      // Place prediction on blockchain
      await predict(marketIdNum, outcomeStr, amountMicroStx);
      
      // Success feedback
      alert(`Prediction placed successfully! You predicted ${getMarketOutcomeLabel(outcome)}`);
      
      // Reset form
      setAmountInput('');
      setError(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already logged by useContract
      setError('Failed to place prediction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle outcome selection
   */
  const handleOutcomeChange = (newOutcome: MarketOutcome) => {
    setOutcome(newOutcome);
    setError(null);
  };

  /**
   * Handle amount input change
   */
  const handleAmountChange = (value: string) => {
    // Allow only valid number format
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmountInput(value);
      setError(null);
    }
  };

  return (
    <div className="prediction-form">
      <h3>Place Your Prediction</h3>
      
      <div className="market-info">
        <h4>{market.title}</h4>
        <p className="current-price">
          Current Price: {(market.currentPrice * 100).toFixed(1)}% YES
        </p>
      </div>

      {!isConnected && (
        <div className="warning">
          Please connect your wallet to place a prediction
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Outcome Selection */}
        <div className="form-group">
          <label>Select Outcome *</label>
          <div className="outcome-buttons">
            <button
              type="button"
              className={`outcome-button ${outcome === MarketOutcome.YES ? 'active yes' : ''}`}
              onClick={() => handleOutcomeChange(MarketOutcome.YES)}
              disabled={isSubmitting}
            >
              {getMarketOutcomeLabel(MarketOutcome.YES)}
            </button>
            <button
              type="button"
              className={`outcome-button ${outcome === MarketOutcome.NO ? 'active no' : ''}`}
              onClick={() => handleOutcomeChange(MarketOutcome.NO)}
              disabled={isSubmitting}
            >
              {getMarketOutcomeLabel(MarketOutcome.NO)}
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label htmlFor="amount">
            Amount (STX) *
          </label>
          <input
            id="amount"
            type="text"
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="10.0"
            required
            disabled={isSubmitting}
            aria-invalid={!amountValidation.isValid && amountInput !== ''}
            aria-describedby={error ? 'amount-error' : undefined}
          />
          {!amountValidation.isValid && amountInput && (
            <span className="error" role="alert">
              {amountValidation.error}
            </span>
          )}
          <span className="hint">
            Minimum: 1 STX
          </span>
        </div>

        {/* Prediction Summary */}
        {potentialShares && (
          <div className="prediction-summary">
            <h4>Prediction Summary</h4>
            <div className="summary-row">
              <span>Outcome:</span>
              <span className={`outcome-label ${outcome === MarketOutcome.YES ? 'yes' : 'no'}`}>
                {getMarketOutcomeLabel(outcome)}
              </span>
            </div>
            <div className="summary-row">
              <span>Amount:</span>
              <span>{amountInput} STX</span>
            </div>
            <div className="summary-row">
              <span>Potential Shares:</span>
              <span>~{potentialShares}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div id="amount-error" className="error-box" role="alert">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isSubmitting || !amountValidation.isValid}
          className="submit-button"
        >
          {isSubmitting ? 'Placing Prediction...' : 'Place Prediction'}
        </button>
      </form>

      {/* Information Section */}
      <div className="info-section">
        <h4>How Predictions Work</h4>
        <ul>
          <li>Choose YES or NO based on your prediction</li>
          <li>Enter the amount of STX you want to stake</li>
          <li>Receive shares based on the current market price</li>
          <li>Claim winnings if your prediction is correct</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example CSS (for reference)
 * 
 * .prediction-form {
 *   max-width: 500px;
 *   margin: 0 auto;
 *   padding: 1.5rem;
 *   border: 1px solid #ddd;
 *   border-radius: 8px;
 * }
 * 
 * .market-info {
 *   margin-bottom: 1.5rem;
 *   padding-bottom: 1rem;
 *   border-bottom: 1px solid #eee;
 * }
 * 
 * .current-price {
 *   color: #666;
 *   font-size: 0.875rem;
 * }
 * 
 * .outcome-buttons {
 *   display: grid;
 *   grid-template-columns: 1fr 1fr;
 *   gap: 1rem;
 * }
 * 
 * .outcome-button {
 *   padding: 1rem;
 *   border: 2px solid #ddd;
 *   border-radius: 4px;
 *   background-color: white;
 *   font-size: 1rem;
 *   font-weight: 600;
 *   cursor: pointer;
 *   transition: all 0.2s;
 * }
 * 
 * .outcome-button:hover:not(:disabled) {
 *   border-color: #007bff;
 * }
 * 
 * .outcome-button.active.yes {
 *   background-color: #28a745;
 *   border-color: #28a745;
 *   color: white;
 * }
 * 
 * .outcome-button.active.no {
 *   background-color: #dc3545;
 *   border-color: #dc3545;
 *   color: white;
 * }
 * 
 * .prediction-summary {
 *   padding: 1rem;
 *   background-color: #f8f9fa;
 *   border-radius: 4px;
 *   margin-bottom: 1rem;
 * }
 * 
 * .summary-row {
 *   display: flex;
 *   justify-content: space-between;
 *   margin-bottom: 0.5rem;
 * }
 * 
 * .outcome-label.yes {
 *   color: #28a745;
 *   font-weight: 600;
 * }
 * 
 * .outcome-label.no {
 *   color: #dc3545;
 *   font-weight: 600;
 * }
 * 
 * .error-box {
 *   padding: 1rem;
 *   background-color: #f8d7da;
 *   border: 1px solid #f5c6cb;
 *   border-radius: 4px;
 *   color: #721c24;
 *   margin-bottom: 1rem;
 * }
 */

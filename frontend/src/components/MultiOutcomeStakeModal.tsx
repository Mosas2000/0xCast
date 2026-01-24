import React, { useState } from 'react';
import { MultiMarket } from '../types/multiMarket';
import { Modal } from './Modal';

interface Props {
  market: MultiMarket;
  outcomeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MultiOutcomeStakeModal: React.FC<Props> = ({
  market,
  outcomeIndex,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const outcome = market.outcomes[outcomeIndex];
  
  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement actual staking logic with Stacks wallet
      // This would use @stacks/connect to open wallet
      // and call the stake-on-outcome function
      
      console.log('Staking', amount, 'STX on outcome', outcomeIndex, 'in market', market.id);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Stake failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake');
    } finally {
      setIsLoading(false);
    }
  };

  const potentialReturn = () => {
    const stakeAmount = parseFloat(amount) || 0;
    if (stakeAmount === 0 || outcome.stake === 0) return 0;
    
    const totalPool = market.totalPool / 1000000;
    const newTotalPool = totalPool + stakeAmount;
    const outcomeStake = outcome.stake / 1000000;
    const newOutcomeStake = outcomeStake + stakeAmount;
    
    // Calculate potential return if this outcome wins
    return (stakeAmount / newOutcomeStake) * newTotalPool;
  };

  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stake on "${outcome.name}"`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount (STX)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.0"
            min="0"
            step="0.1"
          />
        </div>
        
        <div className="p-4 bg-slate-700 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current odds:</span>
            <span className="text-slate-200 font-medium">{outcome.odds.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Your stake:</span>
            <span className="text-slate-200 font-medium">{amount || '0'} STX</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-600">
            <span className="text-slate-300 font-medium">Potential return:</span>
            <span className="text-green-400 font-bold">~{potentialReturn().toFixed(2)} STX</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStake}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Staking...' : 'Stake'}
          </button>
        </div>

        <div className="text-xs text-slate-400 text-center">
          Make sure you have connected your Stacks wallet
        </div>
      </div>
    </Modal>
  );
};

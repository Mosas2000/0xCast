import React, { useState } from 'react';
import { MultiMarket } from '../types/multiMarket';
import { MultiOutcomeStakeModal } from './MultiOutcomeStakeModal';

interface Props {
  market: MultiMarket;
  onRefresh?: () => void;
}

export const MultiOutcomeCard: React.FC<Props> = ({ market, onRefresh }) => {
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<number | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const handleStake = (outcomeIndex: number) => {
    setSelectedOutcomeIndex(outcomeIndex);
    setIsStakeModalOpen(true);
  };

  const handleStakeComplete = () => {
    setIsStakeModalOpen(false);
    setSelectedOutcomeIndex(null);
    onRefresh?.();
  };

  const isActive = market.status === 0;
  const isResolved = market.status === 1;

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-100">{market.question}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-500/20 text-green-400' : 
              isResolved ? 'bg-blue-500/20 text-blue-400' : 
              'bg-gray-500/20 text-gray-400'
            }`}>
              {isActive ? 'Active' : isResolved ? 'Resolved' : 'Ended'}
            </span>
          </div>
          
          <div className="text-sm text-slate-400">
            Created by {market.creator.slice(0, 8)}...{market.creator.slice(-6)}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {market.outcomes
            .filter((_, i) => i < market.outcomeCount)
            .map((outcome) => {
              const isWinner = isResolved && market.winningOutcome === outcome.index;
              
              return (
                <div 
                  key={outcome.index}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    isWinner 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-slate-700 hover:bg-slate-650'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-200">
                        {outcome.name}
                      </div>
                      {isWinner && (
                        <span className="px-2 py-0.5 bg-green-500/30 text-green-300 rounded text-xs font-medium">
                          Winner
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {(outcome.stake / 1000000).toFixed(2)} STX staked
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-100">
                        {outcome.odds.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">odds</div>
                    </div>
                    
                    {isActive && (
                      <button
                        onClick={() => handleStake(outcome.index)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Stake
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        
        <div className="pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Pool:</span>
              <span className="ml-2 font-medium text-slate-200">
                {(market.totalPool / 1000000).toFixed(2)} STX
              </span>
            </div>
            <div>
              <span className="text-slate-400">Outcomes:</span>
              <span className="ml-2 font-medium text-slate-200">
                {market.outcomeCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedOutcomeIndex !== null && (
        <MultiOutcomeStakeModal
          market={market}
          outcomeIndex={selectedOutcomeIndex}
          isOpen={isStakeModalOpen}
          onClose={() => setIsStakeModalOpen(false)}
          onSuccess={handleStakeComplete}
        />
      )}
    </>
  );
};

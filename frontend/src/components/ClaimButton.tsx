import { useState } from 'react';
import { Position } from '../types/market';
import { formatPositionValue } from '../utils/positionCalculations';
import { useClaim } from '../hooks/useClaim';

interface ClaimButtonProps {
    marketId: number;
    position: Position;
    claimableAmount: number;
    onSuccess?: () => void;
    className?: string;
}

export function ClaimButton({ marketId, position, claimableAmount, onSuccess, className = '' }: ClaimButtonProps) {
    const { claim, isLoading, error, txId } = useClaim();

    const handleClaim = async () => {
        await claim(marketId, () => {
            if (onSuccess) {
                onSuccess();
            }
        });
    };

    if (position.claimed) {
        return (
            <div className={`text-center py-2 text-sm text-slate-500 ${className}`.trim()}>
                ✓ Already claimed
            </div>
        );
    }

    if (txId) {
        return (
            <div className={`text-center py-2 ${className}`.trim()}>
                <div className="text-sm text-green-400 mb-1">✓ Claim submitted!</div>
                <div className="text-xs text-slate-500 break-all">TX: {txId.slice(0, 8)}...{txId.slice(-8)}</div>
            </div>
        );
    }

    return (
        <div className={className}>
            {error && (
                <div className="mb-2 p-2 bg-red-500/10 border border-red-500/50 rounded text-xs text-red-400">
                    {error}
                </div>
            )}

            <button
                onClick={handleClaim}
                disabled={isLoading || position.claimed}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Claiming...' : `Claim ${formatPositionValue(claimableAmount)}`}
            </button>
        </div>
    );
}

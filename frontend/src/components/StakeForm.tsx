import { useState } from 'react';
import { Market, MarketOutcome } from '../types/market';
import { OutcomeSelector } from './OutcomeSelector';
import { StakeInput } from './StakeInput';
import { WinningsPreview } from './WinningsPreview';
import { TransactionStatus } from './TransactionStatus';
import { useStake } from '../hooks/useStake';
import { useWallet } from '../hooks/useWallet';
import { calculateOdds } from '../utils/contractHelpers';
import { MIN_STAKE, MAX_STAKE } from '../constants/markets';

interface StakeFormProps {
    market: Market;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export function StakeForm({ market, onSuccess, onCancel, className = '' }: StakeFormProps) {
    const { isConnected } = useWallet();
    const { placeYesStake, placeNoStake, isLoading, error, txId } = useStake();

    const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null);
    const [stakeAmount, setStakeAmount] = useState<number>(10);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const odds = calculateOdds(market.totalYesStake, market.totalNoStake);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            return;
        }

        if (!selectedOutcome || selectedOutcome === MarketOutcome.NONE) {
            return;
        }

        if (stakeAmount < MIN_STAKE || stakeAmount > MAX_STAKE) {
            return;
        }

        if (!showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        // Place the stake
        const stakeFunction = selectedOutcome === MarketOutcome.YES ? placeYesStake : placeNoStake;

        await stakeFunction(market.id, stakeAmount, () => {
            if (onSuccess) {
                onSuccess();
            }
        });
    };

    const handleBack = () => {
        setShowConfirmation(false);
    };

    if (!isConnected) {
        return (
            <div className={`text-center py-8 ${className}`.trim()}>
                <p className="text-slate-400">Please connect your wallet to stake</p>
            </div>
        );
    }

    if (txId) {
        return (
            <div className={`py-8 ${className}`.trim()}>
                <div className="mb-6 text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Stake Submitted!</h3>
                    <p className="text-slate-400 mb-4">Your transaction has been broadcast to the network</p>
                </div>

                <TransactionStatus 
                    txId={txId} 
                    onSuccess={onSuccess}
                    className="mb-6"
                />

                {onSuccess && (
                    <button
                        onClick={onSuccess}
                        className="w-full px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            {!showConfirmation ? (
                <>
                    {/* Outcome Selection */}
                    <OutcomeSelector
                        selected={selectedOutcome}
                        onSelect={setSelectedOutcome}
                        yesOdds={odds.yes}
                        noOdds={odds.no}
                        className="mb-6"
                    />

                    {/* Stake Amount */}
                    <StakeInput
                        value={stakeAmount}
                        onChange={setStakeAmount}
                        min={MIN_STAKE}
                        max={MAX_STAKE}
                        className="mb-6"
                    />

                    {/* Winnings Preview */}
                    <WinningsPreview
                        stake={stakeAmount}
                        outcome={selectedOutcome}
                        yesStake={market.totalYesStake}
                        noStake={market.totalNoStake}
                        className="mb-6"
                    />

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!selectedOutcome || selectedOutcome === MarketOutcome.NONE || isLoading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Review Stake
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Confirmation View */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white mb-4">Confirm Your Stake</h3>

                        <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Market:</span>
                                <span className="text-white font-medium text-right max-w-xs truncate">{market.question}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Outcome:</span>
                                <span className={selectedOutcome === MarketOutcome.YES ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                    {selectedOutcome === MarketOutcome.YES ? 'YES' : 'NO'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Stake Amount:</span>
                                <span className="text-white font-bold">{stakeAmount.toFixed(2)} STX</span>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Confirmation Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Submitting...' : 'Confirm Stake'}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

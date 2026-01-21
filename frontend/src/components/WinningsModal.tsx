import { Position, Market } from '../types/market';
import { Modal } from './Modal';
import { ClaimButton } from './ClaimButton';
import { calculateClaimableAmount, formatPositionValue } from '../utils/positionCalculations';
import { microStxToStx } from '../constants/markets';
import { calculateOdds } from '../utils/contractHelpers';

interface WinningsModalProps {
    position: Position | null;
    market: Market | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function WinningsModal({ position, market, isOpen, onClose, onSuccess }: WinningsModalProps) {
    if (!position || !market) return null;

    const claimableAmount = calculateClaimableAmount(position, market);
    const totalStaked = position.yesStake + position.noStake;
    const winningStake = market.outcome === 1 ? position.yesStake : position.noStake;
    const totalWinningPool = market.outcome === 1 ? market.totalYesStake : market.totalNoStake;
    const totalPool = market.totalYesStake + market.totalNoStake;

    const userShare = totalWinningPool > 0 ? (winningStake / totalWinningPool) * 100 : 0;
    const profit = claimableAmount - totalStaked;
    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Winnings Breakdown">
            <div className="space-y-6">
                {/* Market Info */}
                <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Market Question</h3>
                    <p className="text-white">{market.question}</p>
                </div>

                {/* Original Stake */}
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Your Stakes</h3>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">YES Stake:</span>
                        <span className="text-white font-medium">{formatPositionValue(position.yesStake)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">NO Stake:</span>
                        <span className="text-white font-medium">{formatPositionValue(position.noStake)}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-700 flex justify-between">
                        <span className="text-slate-300 font-medium">Total Staked:</span>
                        <span className="text-white font-bold">{formatPositionValue(totalStaked)}</span>
                    </div>
                </div>

                {/* Pool Breakdown */}
                <div className="p-4 bg-slate-900/50 rounded-lg space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Pool Distribution</h3>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Pool:</span>
                        <span className="text-white font-medium">{formatPositionValue(totalPool)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Winning Pool ({market.outcome === 1 ? 'YES' : 'NO'}):</span>
                        <span className="text-green-400 font-medium">{formatPositionValue(totalWinningPool)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Your Share:</span>
                        <span className="text-primary-400 font-medium">{userShare.toFixed(2)}%</span>
                    </div>
                </div>

                {/* Payout Calculation */}
                <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg space-y-3">
                    <h3 className="text-sm font-medium text-primary-300 mb-3">Payout Calculation</h3>

                    <div className="text-xs text-slate-400 space-y-1">
                        <p>Your Share: {userShare.toFixed(2)}% of Total Pool</p>
                        <p>Formula: ({formatPositionValue(winningStake)} / {formatPositionValue(totalWinningPool)}) × {formatPositionValue(totalPool)}</p>
                    </div>

                    <div className="pt-3 border-t border-primary-500/30 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-300 font-medium">Total Payout:</span>
                            <span className="text-primary-400 font-bold text-lg">{formatPositionValue(claimableAmount)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Profit:</span>
                            <span className={`font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {profit >= 0 ? '+' : ''}{formatPositionValue(Math.abs(profit))}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">ROI:</span>
                            <span className={`font-medium ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Claim Button */}
                <ClaimButton
                    marketId={market.id}
                    position={position}
                    claimableAmount={claimableAmount}
                    onSuccess={() => {
                        if (onSuccess) onSuccess();
                        setTimeout(onClose, 2000);
                    }}
                />
            </div>
        </Modal>
    );
}

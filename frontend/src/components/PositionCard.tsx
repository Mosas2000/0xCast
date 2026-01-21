import { Position, Market, MarketStatus } from '../types/market';
import { Card } from './Card';
import { Badge } from './Badge';
import {
    calculateClaimableAmount,
    isWinningPosition,
    formatPositionValue,
    calculateProfitLoss,
    calculateProfitLossPercentage
} from '../utils/positionCalculations';
import { microStxToStx } from '../constants/markets';

interface PositionCardProps {
    position: Position;
    market: Market;
    onClaim?: () => void;
    className?: string;
}

export function PositionCard({ position, market, onClaim, className = '' }: PositionCardProps) {
    const isResolved = market.status === MarketStatus.RESOLVED;
    const isWinner = isWinningPosition(position, market);
    const claimableAmount = calculateClaimableAmount(position, market);
    const profitLoss = calculateProfitLoss(position, market);
    const profitLossPercent = calculateProfitLossPercentage(position, market);

    const totalStaked = position.yesStake + position.noStake;
    const yesStx = microStxToStx(position.yesStake);
    const noStx = microStxToStx(position.noStake);

    return (
        <Card className={className}>
            {/* Market Question */}
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">{market.question}</h4>
                <p className="text-xs text-slate-500">Market #{market.id}</p>
            </div>

            {/* Stakes */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">YES Stake</p>
                    <p className="text-lg font-bold text-green-400">{yesStx.toFixed(2)} STX</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">NO Stake</p>
                    <p className="text-lg font-bold text-red-400">{noStx.toFixed(2)} STX</p>
                </div>
            </div>

            {/* Current Value / Status */}
            {isResolved ? (
                <>
                    {/* Resolved Market Status */}
                    <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Status:</span>
                            {isWinner ? (
                                <Badge variant="success">Won</Badge>
                            ) : (
                                <Badge variant="danger">Lost</Badge>
                            )}
                        </div>

                        {isWinner && (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-400">Claimable:</span>
                                    <span className="text-lg font-bold text-green-400">
                                        {formatPositionValue(claimableAmount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Profit:</span>
                                    <span className="text-sm font-medium text-green-400">
                                        +{formatPositionValue(claimableAmount - totalStaked)} ({(((claimableAmount - totalStaked) / totalStaked) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            </>
                        )}

                        {!isWinner && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Loss:</span>
                                <span className="text-sm font-medium text-red-400">
                                    -{formatPositionValue(totalStaked)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Claim Button */}
                    {isWinner && !position.claimed && onClaim && (
                        <button
                            onClick={onClaim}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                        >
                            Claim {formatPositionValue(claimableAmount)}
                        </button>
                    )}

                    {position.claimed && (
                        <div className="text-center py-2 text-sm text-slate-500">
                            ✓ Already claimed
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Active Market P&L */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Total Staked:</span>
                            <span className="text-white font-medium">{formatPositionValue(totalStaked)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Unrealized P&L:</span>
                            <span className={`font-medium ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {profitLoss >= 0 ? '+' : ''}{formatPositionValue(Math.abs(profitLoss))} ({(profitLossPercent * 100).toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
}

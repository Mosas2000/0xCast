import type { Market } from '../types/market';
import { microStxToStx } from '../constants/markets';
import { blockHeightToDate } from '../utils/blockHeight';

interface MarketDetailsProps {
    market: Market;
    isExpanded: boolean;
    className?: string;
}

export function MarketDetails({ market, isExpanded, className = '' }: MarketDetailsProps) {
    if (!isExpanded) return null;

    const creationDate = new Date(); // Placeholder - would come from market data
    const totalPool = microStxToStx(market.totalYesStake + market.totalNoStake);
    const totalStakes = 0; // Placeholder - would need to track this
    const averageStake = totalStakes > 0 ? totalPool / totalStakes : 0;

    return (
        <div className={`mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4 ${className}`.trim()}>
            {/* Creator Info */}
            <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Created By</h4>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {market.creator.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-white font-mono">
                            {market.creator.slice(0, 8)}...{market.creator.slice(-6)}
                        </p>
                        <p className="text-xs text-slate-500">
                            {creationDate.toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Market Statistics */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-slate-400 mb-1">Total Pool</p>
                    <p className="text-lg font-bold text-white">{totalPool.toFixed(2)} STX</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 mb-1">Participants</p>
                    <p className="text-lg font-bold text-white">{totalStakes}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 mb-1">Average Stake</p>
                    <p className="text-lg font-bold text-white">{averageStake.toFixed(2)} STX</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 mb-1">Market ID</p>
                    <p className="text-lg font-bold text-white">#{market.id}</p>
                </div>
            </div>

            {/* Timeline Info */}
            <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Trading Ends:</span>
                        <span className="text-white">Block {market.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Resolution Date:</span>
                        <span className="text-white">Block {market.resolutionDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

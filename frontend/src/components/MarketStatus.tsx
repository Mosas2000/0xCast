import { Badge } from './Badge';
import { MarketStatus as MarketStatusEnum } from '../types/market';
import { isMarketActive, blocksRemaining, blocksToMinutes, formatTimeRemaining } from '../utils/calculations';

interface MarketStatusProps {
    status: MarketStatusEnum;
    endBlock: number;
    currentBlock: number;
    resolutionBlock?: number;
}

export function MarketStatus({ status, endBlock, currentBlock, resolutionBlock }: MarketStatusProps) {
    // Market is resolved
    if (status === MarketStatusEnum.RESOLVED) {
        return <Badge variant="info">Resolved</Badge>;
    }

    // Market is active (trading open)
    if (isMarketActive(endBlock, currentBlock)) {
        const remaining = blocksRemaining(endBlock, currentBlock);
        const minutes = blocksToMinutes(remaining);
        const timeStr = formatTimeRemaining(minutes);

        return (
            <div className="flex items-center space-x-2">
                <Badge variant="success">Active</Badge>
                <span className="text-xs text-slate-400">
                    Ends in {timeStr}
                </span>
            </div>
        );
    }

    // Market has ended but not yet resolved
    if (resolutionBlock && currentBlock < resolutionBlock) {
        const remaining = blocksRemaining(resolutionBlock, currentBlock);
        const minutes = blocksToMinutes(remaining);
        const timeStr = formatTimeRemaining(minutes);

        return (
            <div className="flex items-center space-x-2">
                <Badge variant="warning">Awaiting Resolution</Badge>
                <span className="text-xs text-slate-400">
                    Can resolve in {timeStr}
                </span>
            </div>
        );
    }

    // Market ended, ready for resolution
    return <Badge variant="warning">Ready to Resolve</Badge>;
}

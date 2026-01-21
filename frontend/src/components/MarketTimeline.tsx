import { Market, MarketStatus } from '../types/market';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { blocksRemaining, blocksToMinutes, formatTimeRemaining } from '../utils/calculations';

interface MarketTimelineProps {
    market: Market;
    className?: string;
}

type Phase = 'created' | 'trading' | 'ended' | 'resolution';

export function MarketTimeline({ market, className = '' }: MarketTimelineProps) {
    const { blockHeight } = useCurrentBlock();

    const getCurrentPhase = (): Phase => {
        if (market.status === MarketStatus.RESOLVED) {
            return 'resolution';
        }
        if (blockHeight >= market.endDate) {
            return 'ended';
        }
        return 'trading';
    };

    const currentPhase = getCurrentPhase();

    const phases: { id: Phase; label: string; isActive: boolean; isComplete: boolean }[] = [
        { id: 'created', label: 'Created', isActive: false, isComplete: true },
        { id: 'trading', label: 'Trading', isActive: currentPhase === 'trading', isComplete: currentPhase !== 'trading' },
        { id: 'ended', label: 'Ended', isActive: currentPhase === 'ended', isComplete: currentPhase === 'resolution' },
        { id: 'resolution', label: 'Resolved', isActive: currentPhase === 'resolution', isComplete: false },
    ];

    const getTimeRemaining = () => {
        if (currentPhase === 'trading') {
            const remaining = blocksRemaining(market.endDate, blockHeight);
            const minutes = blocksToMinutes(remaining);
            return formatTimeRemaining(minutes);
        }
        if (currentPhase === 'ended') {
            const remaining = blocksRemaining(market.resolutionDate, blockHeight);
            const minutes = blocksToMinutes(remaining);
            return `Can resolve in ${formatTimeRemaining(minutes)}`;
        }
        return null;
    };

    const timeRemaining = getTimeRemaining();

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-2">
                {phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center flex-1">
                        {/* Phase Dot */}
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${phase.isActive
                                    ? 'bg-primary-500 border-primary-400 shadow-lg shadow-primary-500/50'
                                    : phase.isComplete
                                        ? 'bg-green-500 border-green-400'
                                        : 'bg-slate-700 border-slate-600'
                                }`}>
                                {phase.isComplete && !phase.isActive ? (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${phase.isActive ? 'bg-white' : 'bg-slate-500'
                                        }`} />
                                )}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${phase.isActive ? 'text-primary-400' : phase.isComplete ? 'text-green-400' : 'text-slate-500'
                                }`}>
                                {phase.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < phases.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${phase.isComplete ? 'bg-green-500' : 'bg-slate-700'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Time Remaining */}
            {timeRemaining && (
                <div className="text-center mt-4">
                    <p className="text-sm text-slate-400">{timeRemaining}</p>
                </div>
            )}
        </div>
    );
}

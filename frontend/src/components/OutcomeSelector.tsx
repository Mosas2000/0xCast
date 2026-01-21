import { MarketOutcome } from '../types/market';

interface OutcomeSelectorProps {
    selected: MarketOutcome | null;
    onSelect: (outcome: MarketOutcome) => void;
    yesOdds: number;
    noOdds: number;
    disabled?: boolean;
    className?: string;
}

export function OutcomeSelector({ selected, onSelect, yesOdds, noOdds, disabled = false, className = '' }: OutcomeSelectorProps) {
    const isYesSelected = selected === MarketOutcome.YES;
    const isNoSelected = selected === MarketOutcome.NO;

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Outcome
            </label>

            <div className="grid grid-cols-2 gap-4">
                {/* YES Button */}
                <button
                    type="button"
                    onClick={() => onSelect(MarketOutcome.YES)}
                    disabled={disabled}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${isYesSelected
                            ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-green-500/50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${isYesSelected ? 'text-green-400' : 'text-slate-300'}`}>
                            YES
                        </div>
                        <div className="text-sm text-slate-400">
                            {yesOdds.toFixed(1)}% odds
                        </div>
                        {isYesSelected && (
                            <div className="mt-2">
                                <svg className="w-6 h-6 mx-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                </button>

                {/* NO Button */}
                <button
                    type="button"
                    onClick={() => onSelect(MarketOutcome.NO)}
                    disabled={disabled}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${isNoSelected
                            ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-red-500/50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${isNoSelected ? 'text-red-400' : 'text-slate-300'}`}>
                            NO
                        </div>
                        <div className="text-sm text-slate-400">
                            {noOdds.toFixed(1)}% odds
                        </div>
                        {isNoSelected && (
                            <div className="mt-2">
                                <svg className="w-6 h-6 mx-auto text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}

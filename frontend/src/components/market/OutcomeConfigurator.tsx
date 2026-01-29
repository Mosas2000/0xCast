import React, { useState } from 'react';

interface OutcomeConfiguratorProps {
    outcomes: string[];
    onChange: (outcomes: string[]) => void;
}

export const OutcomeConfigurator: React.FC<OutcomeConfiguratorProps> = ({ outcomes, onChange }) => {
    const [newOutcome, setNewOutcome] = useState('');

    const addOutcome = () => {
        if (newOutcome.trim() && outcomes.length < 10) {
            onChange([...outcomes, newOutcome.trim()]);
            setNewOutcome('');
        }
    };

    const removeOutcome = (index: number) => {
        if (outcomes.length > 2) {
            const updated = outcomes.filter((_, i) => i !== index);
            onChange(updated);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Market Outcomes</label>
            <div className="space-y-2">
                {outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
                        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
                            {outcome}
                        </div>
                        <button
                            onClick={() => removeOutcome(index)}
                            disabled={outcomes.length <= 2}
                            className="p-2 text-slate-500 hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {outcomes.length < 10 && (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newOutcome}
                        onChange={(e) => setNewOutcome(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addOutcome()}
                        placeholder="Add outcome (e.g. Yes, No, Maybe)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                        onClick={addOutcome}
                        className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            <p className="text-xs text-slate-500">
                Minimum 2 outcomes, maximum 10 outcomes.
            </p>
        </div>
    );
};

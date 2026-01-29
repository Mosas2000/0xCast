import React from 'react';

interface MarketPreviewProps {
    title: string;
    description: string;
    outcomes: string[];
    endBlock: number;
}

export const MarketPreview: React.FC<MarketPreviewProps> = ({ title, description, outcomes, endBlock }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Preview</span>
                <h3 className="text-2xl font-bold text-white leading-tight">
                    {title || 'Untitiled Market'}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                    {description || 'No description provided.'}
                </p>
            </div>

            <div className="space-y-3">
                {outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                        <span className="text-white font-medium">{outcome}</span>
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-500 w-0" />
                            </div>
                            <span className="text-slate-500 text-xs font-mono">0%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-400 text-xs">Closes at block {endBlock}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-green-500 text-xs font-bold uppercase">Pending Deployment</span>
                </div>
            </div>
        </div>
    );
};

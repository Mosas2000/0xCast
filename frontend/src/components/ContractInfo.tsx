import { memo } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_IDENTIFIER } from '../constants/contract';

interface ContractInfoProps {
    className?: string;
}

export const ContractInfo = memo(function ContractInfo({ className = '' }: ContractInfoProps) {
    const explorerUrl = `https://explorer.hiro.so/address/${CONTRACT_IDENTIFIER}?chain=mainnet`;

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(CONTRACT_IDENTIFIER);
            // You could add a toast notification here
            console.log('Contract address copied to clipboard');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        Contract Information
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            ✓ Verified
                        </span>
                    </h3>
                    <p className="text-sm text-slate-400">Deployed on Stacks Mainnet</p>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Contract Address</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-slate-950/50 rounded border border-slate-700/50 text-sm text-slate-300 font-mono overflow-x-auto">
                            {CONTRACT_ADDRESS}
                        </code>
                        <button
                            onClick={handleCopyAddress}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-sm"
                            title="Copy to clipboard"
                        >
                            📋
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Contract Name</label>
                    <code className="block px-3 py-2 bg-slate-950/50 rounded border border-slate-700/50 text-sm text-slate-300 font-mono">
                        {CONTRACT_NAME}
                    </code>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Explorer
                    </a>
                </div>
            </div>
        </div>
    );
});

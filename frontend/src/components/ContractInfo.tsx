import { memo } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_IDENTIFIER } from '../constants/contract';
import { CopyButton } from './CopyButton';
import { ExplorerLink } from './ExplorerLink';

interface ContractInfoProps {
    className?: string;
}

export const ContractInfo = memo(function ContractInfo({ className = '' }: ContractInfoProps) {
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
                        <CopyButton text={CONTRACT_IDENTIFIER} label="Copy" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Contract Name</label>
                    <code className="block px-3 py-2 bg-slate-950/50 rounded border border-slate-700/50 text-sm text-slate-300 font-mono">
                        {CONTRACT_NAME}
                    </code>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <ExplorerLink
                        type="address"
                        address={CONTRACT_IDENTIFIER}
                        label="View on Explorer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                    />
                </div>
            </div>
        </div>
    );
});

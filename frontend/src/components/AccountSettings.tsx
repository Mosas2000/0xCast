import { useWallet } from '../hooks/useWallet';
import { ExportButton } from './ExportButton';
import { useUserPositions } from '../hooks/useUserPositions';
import { useMarkets } from '../hooks/useMarkets';
import { useTransactionHistory } from '../hooks/useTransactionHistory';

export function AccountSettings() {
    const { userAddress, disconnect } = useWallet();
    const { markets } = useMarkets();
    const marketIds = markets.map(m => m.id);
    const { positions } = useUserPositions(marketIds);
    const { transactions } = useTransactionHistory();

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-400">Manage your account and data</p>

            {/* Connected Wallet */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Connected Wallet</label>
                {userAddress ? (
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-white font-mono mb-3">{userAddress}</p>
                        <button
                            onClick={disconnect}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-400">No wallet connected</p>
                    </div>
                )}
            </div>

            {/* Export Data */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Export Data</label>
                <div className="space-y-2">
                    <ExportButton
                        data={positions}
                        filename="positions"
                        type="positions"
                        label="Export Positions"
                    />
                    <ExportButton
                        data={markets}
                        filename="markets"
                        type="markets"
                        label="Export Markets"
                    />
                    <ExportButton
                        data={transactions}
                        filename="transactions"
                        type="transactions"
                        label="Export Transactions"
                    />
                </div>
            </div>

            {/* Clear Data */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Clear Local Data</label>
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Clear All Local Data
                </button>
            </div>
        </div>
    );
}

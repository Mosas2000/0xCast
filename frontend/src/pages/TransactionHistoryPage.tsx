/**
 * Transaction History Page
 */
import { useTransactions } from '@/components/TransactionProvider';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useWallet } from '@/components/WalletProvider';
import { TransactionStatus, getStatusColor } from '@/utils/transactions';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 sm:p-5 text-center">
      <div className="text-[10px] sm:text-xs text-neutral-400 mb-2 uppercase tracking-wide">{label}</div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

export function TransactionHistoryPage() {
  const { isConnected, connect } = useWallet();
  const { transactions, pendingCount, clearHistory, isChecking } = useTransactions();

  const successCount = transactions.filter(tx => tx.status === TransactionStatus.SUCCESS).length;
  const failedCount = transactions.filter(tx => tx.status === TransactionStatus.FAILED).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black pt-[72px] pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto py-10 sm:py-16">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Transaction History</h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto leading-relaxed">Track all your transactions on 0xCast</p>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-neutral-400 mb-5">Connect your wallet to view transaction history</p>
            <button className="py-3 sm:py-4 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-colors" onClick={() => connect()}>Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-[72px] pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto py-10 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Transaction History</h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto leading-relaxed">Track all your transactions on 0xCast</p>
        </div>

        {isChecking && (
          <div className="flex items-center justify-center gap-2 mb-4 text-xs sm:text-sm text-amber-500">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Checking pending transactions...
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Pending" value={pendingCount} color={getStatusColor(TransactionStatus.PENDING)} />
          <StatCard label="Confirmed" value={successCount} color={getStatusColor(TransactionStatus.SUCCESS)} />
          <StatCard label="Failed" value={failedCount} color={getStatusColor(TransactionStatus.FAILED)} />
        </div>

        <TransactionHistory transactions={transactions} onClear={clearHistory} maxItems={50} />
      </div>
    </div>
  );
}

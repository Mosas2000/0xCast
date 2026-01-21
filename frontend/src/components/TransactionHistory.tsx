import { useState } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../types/transaction';
import { Badge } from './Badge';

interface TransactionHistoryProps {
    transactions: Transaction[];
    className?: string;
}

const TYPE_LABELS: Record<TransactionType, string> = {
    [TransactionType.CREATE_MARKET]: 'Create Market',
    [TransactionType.STAKE_YES]: 'Stake YES',
    [TransactionType.STAKE_NO]: 'Stake NO',
    [TransactionType.CLAIM_WINNINGS]: 'Claim Winnings',
    [TransactionType.RESOLVE_MARKET]: 'Resolve Market',
};

export function TransactionHistory({ transactions, className = '' }: TransactionHistoryProps) {
    const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');

    const filteredTransactions = filterStatus === 'all'
        ? transactions
        : transactions.filter(tx => tx.status === filterStatus);

    const getStatusBadge = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.SUCCESS:
                return <Badge variant="success">Success</Badge>;
            case TransactionStatus.FAILED:
                return <Badge variant="danger">Failed</Badge>;
            case TransactionStatus.PENDING:
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className={className}>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilterStatus(TransactionStatus.SUCCESS)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === TransactionStatus.SUCCESS
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    Success
                </button>
                <button
                    onClick={() => setFilterStatus(TransactionStatus.PENDING)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === TransactionStatus.PENDING
                            ? 'bg-yellow-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilterStatus(TransactionStatus.FAILED)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === TransactionStatus.FAILED
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    Failed
                </button>
            </div>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    No transactions found
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                        <div
                            key={tx.txId}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{TYPE_LABELS[tx.type]}</span>
                                        {getStatusBadge(tx.status)}
                                    </div>
                                    <p className="text-xs text-slate-500">{formatDate(tx.timestamp)}</p>
                                </div>
                                <a
                                    href={`https://explorer.hiro.so/txid/${tx.txId}?chain=mainnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    View →
                                </a>
                            </div>

                            {tx.metadata?.question && (
                                <p className="text-sm text-slate-400 mt-2 truncate">
                                    {tx.metadata.question}
                                </p>
                            )}

                            {tx.error && (
                                <p className="text-xs text-red-400 mt-2">{tx.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

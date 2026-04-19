import React, { useState, useEffect } from 'react';

interface RewardTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'referral' | 'claim' | 'pending';
  description: string;
  referralUser?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface RewardHistoryProps {
  userAddress: string | null;
  maxItems?: number;
}

export const RewardHistory: React.FC<RewardHistoryProps> = ({ userAddress, maxItems = 10 }) => {
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'referral' | 'claim' | 'pending'>('all');

  useEffect(() => {
    if (!userAddress) return;

    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        // This would fetch from the backend
        console.log('Loading reward transactions for:', userAddress);
        setTransactions([]);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [userAddress]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const displayTransactions = filteredTransactions.slice(0, maxItems);

  const getTotalEarned = () => {
    return transactions
      .filter((tx) => tx.type === 'referral' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalClaimed = () => {
    return transactions
      .filter((tx) => tx.type === 'claim' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalPending = () => {
    return transactions
      .filter((tx) => tx.type === 'pending' || (tx.type === 'referral' && tx.status === 'pending'))
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  if (!userAddress) {
    return (
      <div className="reward-history reward-history--empty">
        <p>Connect your wallet to view reward history</p>
      </div>
    );
  }

  return (
    <div className="reward-history">
      <div className="reward-history__header">
        <h3>Reward History</h3>
      </div>

      <div className="reward-history__summary">
        <div className="reward-history__summary-item">
          <span className="reward-history__summary-label">Total Earned</span>
          <span className="reward-history__summary-value">
            {getTotalEarned().toFixed(4)} OXC
          </span>
        </div>
        <div className="reward-history__summary-item">
          <span className="reward-history__summary-label">Total Claimed</span>
          <span className="reward-history__summary-value">
            {getTotalClaimed().toFixed(4)} OXC
          </span>
        </div>
        <div className="reward-history__summary-item">
          <span className="reward-history__summary-label">Pending</span>
          <span className="reward-history__summary-value">
            {getTotalPending().toFixed(4)} OXC
          </span>
        </div>
      </div>

      <div className="reward-history__filters">
        <button
          className={`reward-history__filter ${filter === 'all' ? 'reward-history__filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`reward-history__filter ${filter === 'referral' ? 'reward-history__filter--active' : ''}`}
          onClick={() => setFilter('referral')}
        >
          Referral Rewards
        </button>
        <button
          className={`reward-history__filter ${filter === 'claim' ? 'reward-history__filter--active' : ''}`}
          onClick={() => setFilter('claim')}
        >
          Claims
        </button>
        <button
          className={`reward-history__filter ${filter === 'pending' ? 'reward-history__filter--active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      <div className="reward-history__list">
        {isLoading ? (
          <div className="reward-history__loading">
            <p>Loading transactions...</p>
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="reward-history__empty">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="reward-history__table">
            <div className="reward-history__table-header">
              <div className="reward-history__table-cell reward-history__table-cell--date">Date</div>
              <div className="reward-history__table-cell reward-history__table-cell--type">Type</div>
              <div className="reward-history__table-cell reward-history__table-cell--description">
                Description
              </div>
              <div className="reward-history__table-cell reward-history__table-cell--amount">Amount</div>
              <div className="reward-history__table-cell reward-history__table-cell--status">Status</div>
            </div>

            {displayTransactions.map((tx) => (
              <div key={tx.id} className="reward-history__table-row">
                <div className="reward-history__table-cell reward-history__table-cell--date">
                  {tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString()}
                </div>
                <div className="reward-history__table-cell reward-history__table-cell--type">
                  <span className={`reward-history__type-badge reward-history__type-badge--${tx.type}`}>
                    {tx.type === 'referral' ? 'Referral' : tx.type === 'claim' ? 'Claim' : 'Pending'}
                  </span>
                </div>
                <div className="reward-history__table-cell reward-history__table-cell--description">
                  {tx.description}
                </div>
                <div className="reward-history__table-cell reward-history__table-cell--amount">
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)} OXC
                </div>
                <div className="reward-history__table-cell reward-history__table-cell--status">
                  <span className={`reward-history__status-badge reward-history__status-badge--${tx.status}`}>
                    {tx.status === 'completed' ? '✓' : tx.status === 'pending' ? '...' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredTransactions.length > maxItems && (
        <div className="reward-history__footer">
          <p>Showing {displayTransactions.length} of {filteredTransactions.length} transactions</p>
        </div>
      )}
    </div>
  );
};

export default RewardHistory;

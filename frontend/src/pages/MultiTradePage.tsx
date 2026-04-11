import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMultiMarkets } from '../hooks/useMultiMarkets';
import { useMultiStake } from '../hooks/useMultiStake';
import { formatStx } from '../utils/helpers';
import { validateAmount } from '../utils/validation';
import { MIN_STAKE, MAX_STAKE } from '../constants';
import { useWallet } from '../components/WalletProvider';

export function MultiTradePage() {
  const { id } = useParams<{ id: string }>();
  const marketId = id ? Number(id) : NaN;
  const { markets, isLoading, error, refetch } = useMultiMarkets();
  const { placeOutcomeStake, isLoading: isStaking, error: stakeError, txId } = useMultiStake();
  const { isConnected, connect } = useWallet();
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('10');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  const market = useMemo(() => markets.find((item) => item.id === marketId) || null, [markets, marketId]);
  const totalPool = useMemo(
    () => (market ? market.outcomes.reduce((sum, outcome) => sum + outcome.stake, 0) : 0),
    [market]
  );

  const stakeValidation = useMemo(
    () => validateAmount(stakeAmount, MIN_STAKE, MAX_STAKE),
    [stakeAmount]
  );

  const handleStake = async () => {
    if (!market || selectedOutcome === null) return;
    if (!stakeValidation.isValid) return;
    const amount = Number(stakeAmount);
    setTradeSuccess(false);
    await placeOutcomeStake(market.id, selectedOutcome, amount, async () => {
      setTradeSuccess(true);
      setSelectedOutcome(null);
      await refetch();
    });
  };

  if (isLoading) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Loading multi-outcome market...</p>
      </div>
    );
  }

  if (error || !market || Number.isNaN(marketId)) {
    return (
      <div className="pt-[72px] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Market Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || 'The selected multi-outcome market is not available.'}
          </p>
          <Link to="/multi-markets" className="btn btn-primary">
            Back to Multi Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-white dark:bg-black">
      <div className="container max-w-5xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <Link to="/multi-markets" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white mb-8">
          Back to Multi Markets
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">{market.question}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Total Pool: {formatStx(totalPool)}</p>
          </div>

          <div className="card p-4 sm:p-6 lg:p-8 space-y-4">
            {market.outcomes.map((outcome) => (
              <button
                key={outcome.index}
                type="button"
                onClick={() => setSelectedOutcome(outcome.index)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  selectedOutcome === outcome.index
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-black dark:text-white">{outcome.name}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{outcome.percentage}%</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${outcome.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">{formatStx(outcome.stake)} staked</p>
              </button>
            ))}
          </div>

          <div className="card p-4 sm:p-6 lg:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Place Stake</h3>
            {!isConnected ? (
              <button type="button" className="btn btn-primary" onClick={() => connect()}>
                Connect Wallet
              </button>
            ) : (
              <>
                <input
                  type="number"
                  min={MIN_STAKE}
                  max={MAX_STAKE}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="input w-full"
                />
                {!stakeValidation.isValid && (
                  <p className="text-sm text-red-500">{stakeValidation.error}</p>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={selectedOutcome === null || !stakeValidation.isValid || isStaking}
                  onClick={handleStake}
                >
                  {isStaking ? 'Submitting...' : 'Stake on Selected Outcome'}
                </button>
              </>
            )}

            {stakeError && <p className="text-sm text-red-500">{stakeError}</p>}
            {tradeSuccess && <p className="text-sm text-emerald-500">Stake submitted successfully.</p>}
            {txId && (
              <p className="text-xs text-neutral-500 break-all">
                Transaction: {txId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

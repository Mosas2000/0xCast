import React, { useState } from 'react';
import { AMMPool, SwapQuote } from '@/types/amm';
import { useAMMPool, useSwapQuote } from '@/hooks/useAMM';

interface PoolCardProps {
  poolId: string;
  onSelect: (poolId: string) => void;
}

export function AMMPoolCard({ poolId, onSelect }: PoolCardProps) {
  const { pool, loading, error } = useAMMPool(poolId);

  if (loading) return <div className="p-4">Loading pool data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!pool) return <div className="p-4">Pool not found</div>;

  return (
    <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => onSelect(poolId)}>
      <div className="flex justify-between mb-2">
        <span className="font-semibold">
          {pool.tokenA} / {pool.tokenB}
        </span>
        <span className="text-sm text-gray-600">{pool.fee / 100}%</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Reserve A</div>
          <div className="font-mono">{Number(pool.reserveA) / 1e12}</div>
        </div>
        <div>
          <div className="text-gray-600">Reserve B</div>
          <div className="font-mono">{Number(pool.reserveB) / 1e12}</div>
        </div>
      </div>
    </div>
  );
}

interface SwapInterfaceProps {
  pool: AMMPool;
  onSwap: (amountIn: bigint, amountOut: bigint) => Promise<void>;
}

export function SwapInterface({ pool, onSwap }: SwapInterfaceProps) {
  const [amountIn, setAmountIn] = useState<string>('');
  const [tokenAtoB, setTokenAtoB] = useState(true);
  const [loading, setLoading] = useState(false);

  const parsedAmount = amountIn ? BigInt(Math.floor(Number(amountIn) * 1e12)) : 0n;
  const { quote, loading: quoteLoading } = useSwapQuote(pool, parsedAmount, tokenAtoB);

  const handleSwap = async () => {
    if (!quote) return;

    setLoading(true);
    try {
      await onSwap(parsedAmount, quote.amountOut);
      setAmountIn('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Swap</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              placeholder="Amount"
              className="flex-1 border rounded px-3 py-2"
            />
            <select className="border rounded px-3 py-2">
              <option>{tokenAtoB ? pool.tokenA : pool.tokenB}</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setTokenAtoB(!tokenAtoB)}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          ↕ Swap
        </button>

        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quoteLoading ? 'Loading...' : quote ? (Number(quote.amountOut) / 1e12).toFixed(6) : '0'}
              disabled
              className="flex-1 border rounded px-3 py-2 bg-gray-50"
            />
            <select className="border rounded px-3 py-2">
              <option>{tokenAtoB ? pool.tokenB : pool.tokenA}</option>
            </select>
          </div>
        </div>

        {quote && (
          <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Price Impact</span>
              <span className={quote.priceImpact > 0.05 ? 'text-red-600' : ''}>{(quote.priceImpact * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slippage</span>
              <span>{quote.slippage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee</span>
              <span className="font-mono">{(Number(quote.fee) / 1e12).toFixed(6)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!quote || loading || quoteLoading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
}

interface LiquidityManagementProps {
  pool: AMMPool;
  onAddLiquidity: (amountA: bigint, amountB: bigint) => Promise<void>;
  onRemoveLiquidity: (liquidity: bigint) => Promise<void>;
}

export function LiquidityManagement({
  pool,
  onAddLiquidity,
  onRemoveLiquidity,
}: LiquidityManagementProps) {
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [removeLiquidity, setRemoveLiquidity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const a = BigInt(Math.floor(Number(amountA) * 1e12));
      const b = BigInt(Math.floor(Number(amountB) * 1e12));
      await onAddLiquidity(a, b);
      setAmountA('');
      setAmountB('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const liq = BigInt(Math.floor(Number(removeLiquidity) * 1e12));
      await onRemoveLiquidity(liq);
      setRemoveLiquidity('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Liquidity</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('add')}
          className={`flex-1 py-2 rounded ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Add
        </button>
        <button
          onClick={() => setTab('remove')}
          className={`flex-1 py-2 rounded ${tab === 'remove' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Remove
        </button>
      </div>

      {tab === 'add' ? (
        <div className="space-y-3">
          <input
            type="number"
            value={amountA}
            onChange={e => setAmountA(e.target.value)}
            placeholder={`${pool.tokenA} amount`}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            value={amountB}
            onChange={e => setAmountB(e.target.value)}
            placeholder={`${pool.tokenB} amount`}
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !amountA || !amountB}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Liquidity'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="number"
            value={removeLiquidity}
            onChange={e => setRemoveLiquidity(e.target.value)}
            placeholder="Liquidity amount"
            className="w-full border rounded px-3 py-2"
          />
          <button
            onClick={handleRemove}
            disabled={loading || !removeLiquidity}
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Removing...' : 'Remove Liquidity'}
          </button>
        </div>
      )}
    </div>
  );
}

interface PoolListProps {
  pools: Array<{ poolId: string; model: string }>;
  onSelectPool: (poolId: string) => void;
}

export function PoolList({ pools, onSelectPool }: PoolListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Available Pools</h3>
      {pools.length === 0 ? (
        <p className="text-gray-600">No pools available</p>
      ) : (
        pools.map(pool => (
          <button
            key={pool.poolId}
            onClick={() => onSelectPool(pool.poolId)}
            className="w-full text-left p-3 border rounded hover:bg-blue-50"
          >
            <div className="flex justify-between">
              <span className="font-medium">{pool.poolId}</span>
              <span className="text-sm text-gray-600">{pool.model}</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

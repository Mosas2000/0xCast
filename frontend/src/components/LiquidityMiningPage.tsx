import React, { useState } from 'react';
import { LiquidityRewardsCalculator } from './LiquidityRewardsCalculator';
import { RewardHistoryChart } from './RewardHistoryChart';
import { APYComparison } from './APYComparison';
import type { MarketVolume } from '../utils/liquidityRewardsCalculator';

interface LiquidityMiningPageProps {
  marketId?: number;
  totalLiquidity: number;
  dailyVolume: number;
  volume: MarketVolume;
}

export const LiquidityMiningPage: React.FC<LiquidityMiningPageProps> = ({
  marketId,
  totalLiquidity,
  dailyVolume,
  volume,
}) => {
  const [selectedTab, setSelectedTab] = useState<'calculator' | 'history' | 'comparison'>('calculator');
  const [liquidityAmount, setLiquidityAmount] = useState(1000);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Liquidity Mining Rewards
        </h1>
        <p className="text-gray-600">
          Calculate potential rewards and track your liquidity mining performance
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('calculator')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'calculator'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setSelectedTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              APY Comparison
            </button>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Liquidity</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalLiquidity.toLocaleString()} STX
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-gray-900">
            {volume.volume24h.toLocaleString()} STX
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">30d Volume</div>
          <div className="text-2xl font-bold text-gray-900">
            {volume.volume30d.toLocaleString()} STX
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedTab === 'calculator' && (
          <LiquidityRewardsCalculator
            marketId={marketId}
            totalLiquidity={totalLiquidity}
            dailyVolume={dailyVolume}
            onCalculate={(apy) => console.log('APY:', apy)}
          />
        )}

        {selectedTab === 'history' && (
          <RewardHistoryChart marketId={marketId} />
        )}

        {selectedTab === 'comparison' && (
          <APYComparison
            liquidityAmount={liquidityAmount}
            totalLiquidity={totalLiquidity}
            volume={volume}
            marketId={marketId}
          />
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How Liquidity Mining Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Provide liquidity to earn a share of trading fees
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Rewards are proportional to your share of total liquidity
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Higher trading volume generates more rewards
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Rewards are distributed continuously based on activity
          </li>
        </ul>
      </div>
    </div>
  );
};

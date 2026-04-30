import React, { useState, useEffect } from 'react';
import { useLiquidityRewards } from '../hooks/useLiquidityRewards';
import { formatRewardAmount, formatAPY } from '../utils/liquidityRewardsCalculator';

interface LiquidityRewardsCalculatorProps {
  marketId?: number;
  totalLiquidity: number;
  dailyVolume: number;
  onCalculate?: (apy: number) => void;
}

export const LiquidityRewardsCalculator: React.FC<
  LiquidityRewardsCalculatorProps
> = ({ marketId, totalLiquidity, dailyVolume, onCalculate }) => {
  const [liquidityAmount, setLiquidityAmount] = useState<string>('1000');
  const { calculateRewards, calculateAPYEstimate } = useLiquidityRewards(marketId);

  const amount = parseFloat(liquidityAmount) || 0;
  const rewards = calculateRewards(amount, totalLiquidity, dailyVolume);
  const apy = calculateAPYEstimate(amount, totalLiquidity, dailyVolume);

  useEffect(() => {
    if (onCalculate) {
      onCalculate(apy);
    }
  }, [apy, onCalculate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLiquidityAmount(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Rewards Calculator</h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Liquidity Amount (STX)
        </label>
        <input
          type="text"
          value={liquidityAmount}
          onChange={handleAmountChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter amount"
        />
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Estimated APY</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatAPY(apy)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Daily Rewards</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatRewardAmount(rewards.dailyReward)} STX
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Weekly Rewards</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatRewardAmount(rewards.weeklyReward)} STX
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Monthly Rewards</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatRewardAmount(rewards.monthlyReward)} STX
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Yearly Rewards</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatRewardAmount(rewards.yearlyReward)} STX
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">
            Estimated Value After 1 Year
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatRewardAmount(rewards.estimatedValue)} STX
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          Calculations based on current market volume of{' '}
          {formatRewardAmount(dailyVolume)} STX/day and total liquidity of{' '}
          {formatRewardAmount(totalLiquidity)} STX.
        </p>
        <p className="mt-2">
          Actual rewards may vary based on market conditions and trading volume.
        </p>
      </div>
    </div>
  );
};

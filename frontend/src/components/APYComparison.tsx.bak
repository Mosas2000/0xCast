import React from 'react';
import { useLiquidityRewards } from '@/hooks/useLiquidityRewards';
import { formatAPY } from '@/utils/liquidityRewardsCalculator';
import type { MarketVolume } from '@/utils/liquidityRewardsCalculator';

interface APYComparisonProps {
  liquidityAmount: number;
  totalLiquidity: number;
  volume: MarketVolume;
  marketId?: number;
}

export const APYComparison: React.FC<APYComparisonProps> = ({
  liquidityAmount,
  totalLiquidity,
  volume,
  marketId,
}) => {
  const { estimateByVolume, getHistoricalAPY } = useLiquidityRewards(marketId);

  const estimates = estimateByVolume(liquidityAmount, totalLiquidity, volume);
  const historicalAPY7d = getHistoricalAPY(7);
  const historicalAPY30d = getHistoricalAPY(30);

  const apyData = [
    {
      label: '24h Volume',
      apy: estimates.based24h.apy,
      description: 'Based on last 24 hours',
      color: 'blue',
    },
    {
      label: '7d Average',
      apy: estimates.based7d.apy,
      description: 'Based on 7-day average',
      color: 'green',
    },
    {
      label: '30d Average',
      apy: estimates.based30d.apy,
      description: 'Based on 30-day average',
      color: 'purple',
    },
  ];

  if (historicalAPY7d > 0) {
    apyData.push({
      label: 'Historical 7d',
      apy: historicalAPY7d,
      description: 'Actual APY last 7 days',
      color: 'orange',
    });
  }

  if (historicalAPY30d > 0) {
    apyData.push({
      label: 'Historical 30d',
      apy: historicalAPY30d,
      description: 'Actual APY last 30 days',
      color: 'red',
    });
  }

  const maxAPY = Math.max(...apyData.map((d) => d.apy));

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; bar: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        bar: 'bg-blue-500',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        bar: 'bg-green-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        bar: 'bg-purple-500',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        bar: 'bg-orange-500',
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        bar: 'bg-red-500',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">APY Comparison</h3>

      <div className="space-y-4">
        {apyData.map((data, index) => {
          const colors = getColorClasses(data.color);
          const percentage = maxAPY > 0 ? (data.apy / maxAPY) * 100 : 0;

          return (
            <div key={index} className={`${colors.bg} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">
                    {data.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.description}
                  </div>
                </div>
                <div className={`text-2xl font-bold ${colors.text}`}>
                  {formatAPY(data.apy)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colors.bar} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Understanding APY</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            APY varies based on trading volume and total liquidity
          </li>
          <li>
            Higher volume periods generate more rewards
          </li>
          <li>
            Historical APY shows actual past performance
          </li>
          <li>
            Future returns may differ from estimates
          </li>
        </ul>
      </div>
    </div>
  );
};

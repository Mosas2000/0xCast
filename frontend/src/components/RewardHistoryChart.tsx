import React from 'react';
import { useLiquidityRewards } from '../hooks/useLiquidityRewards';
import { formatRewardAmount } from '../utils/liquidityRewardsCalculator';

interface RewardHistoryChartProps {
  marketId?: number;
}

export const RewardHistoryChart: React.FC<RewardHistoryChartProps> = ({
  marketId,
}) => {
  const { getHistoricalRewards, getTotalRewards } = useLiquidityRewards(marketId);

  const historyData = getHistoricalRewards();
  const totalRewards = getTotalRewards();

  const maxReward = Math.max(...historyData.map((d) => d.amount), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Reward History</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Earned</div>
          <div className="text-2xl font-bold text-green-600">
            {formatRewardAmount(totalRewards)} STX
          </div>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No reward history available</p>
          <p className="text-sm mt-2">
            Start providing liquidity to earn rewards
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-between gap-2">
            {historyData.map((data, index) => {
              const height = (data.amount / maxReward) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${data.date}: ${formatRewardAmount(data.amount)} STX`}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {formatRewardAmount(data.amount)} STX
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(data.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Days Active</div>
                <div className="text-lg font-semibold">{historyData.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Daily</div>
                <div className="text-lg font-semibold">
                  {formatRewardAmount(totalRewards / historyData.length)} STX
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Best Day</div>
                <div className="text-lg font-semibold">
                  {formatRewardAmount(maxReward)} STX
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

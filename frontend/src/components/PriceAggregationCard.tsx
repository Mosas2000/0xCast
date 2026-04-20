import React, { useEffect, useState } from 'react';
import { AggregatedPrice, OraclePrice } from '@/types/oracle';
import { useOraclePriceAggregation } from '@/hooks/useOracleNetwork';
import { PriceFormatter } from '@/utils/oraclePriceFormatter';

interface PriceAggregationCardProps {
  marketId: string;
  refreshInterval?: number;
  onPriceUpdate?: (price: AggregatedPrice) => void;
  showSources?: boolean;
}

interface PriceDisplay {
  value: string;
  formatted: string;
  timestamp: string;
  confidence: string;
  status: string;
}

const SourcePrice: React.FC<{ price: OraclePrice; isConsensus: boolean }> = ({
  price,
  isConsensus,
}) => {
  const formattedPrice = PriceFormatter.formatOraclePrice(price);

  return (
    <div
      className={`p-3 rounded-lg border ${
        isConsensus
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{price.source}</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">
            {formattedPrice.formatted}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{formattedPrice.timestamp}</p>
          <p className={`text-xs font-medium mt-1 ${
            isConsensus ? 'text-green-700' : 'text-gray-600'
          }`}>
            {isConsensus ? 'Consensus' : formattedPrice.confidence}
          </p>
        </div>
      </div>
    </div>
  );
};

const ConsensusIndicator: React.FC<{
  consensusReached: boolean;
  confidence: number;
}> = ({ consensusReached, confidence }) => {
  if (consensusReached) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        <span className="text-sm font-medium">Consensus Reached</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        Consensus Failed ({PriceFormatter.formatPercentage(confidence, 0)})
      </span>
    </div>
  );
};

export const PriceAggregationCard: React.FC<PriceAggregationCardProps> = ({
  marketId,
  refreshInterval = 5000,
  onPriceUpdate,
  showSources = true,
}) => {
  const { aggregatedPrice, sourcePrices, loading, error, refreshPrice } =
    useOraclePriceAggregation(marketId, refreshInterval);
  const [display, setDisplay] = useState<PriceDisplay | null>(null);

  useEffect(() => {
    if (aggregatedPrice) {
      setDisplay(PriceFormatter.formatAggregatedPrice(aggregatedPrice));
      if (onPriceUpdate) {
        onPriceUpdate(aggregatedPrice);
      }
    }
  }, [aggregatedPrice, onPriceUpdate]);

  const getStatusColor = (): string => {
    if (error) return 'bg-red-50 border-red-300';
    if (aggregatedPrice?.consensusReached) return 'bg-green-50 border-green-300';
    return 'bg-yellow-50 border-yellow-300';
  };

  const getStatusBg = (): string => {
    if (error) return 'bg-red-100';
    if (aggregatedPrice?.consensusReached) return 'bg-green-100';
    return 'bg-yellow-100';
  };

  return (
    <div className={`rounded-lg border p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Price Data</h3>
        <button
          onClick={() => refreshPrice()}
          disabled={loading}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {display && !loading && (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Current Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900">
                {display.formatted}
              </p>
              <p className="text-sm text-gray-600">({display.value})</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Updated {display.timestamp}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-300">
            <ConsensusIndicator
              consensusReached={aggregatedPrice?.consensusReached || false}
              confidence={aggregatedPrice?.confidence || 0}
            />
            <div className={`px-3 py-2 rounded-lg ${getStatusBg()}`}>
              <p className="text-xs font-medium">
                Method: {display.method}
              </p>
            </div>
          </div>

          {showSources && sourcePrices && sourcePrices.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Price Sources ({sourcePrices.length})
              </h4>
              <div className="space-y-2">
                {sourcePrices.map((price) => (
                  <SourcePrice
                    key={price.source}
                    price={price}
                    isConsensus={
                      aggregatedPrice?.consensusReached &&
                      Math.abs(price.value - (aggregatedPrice?.value || 0)) <
                        (aggregatedPrice?.value || 1) * 0.03
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading price data...</span>
        </div>
      )}
    </div>
  );
};

export default PriceAggregationCard;

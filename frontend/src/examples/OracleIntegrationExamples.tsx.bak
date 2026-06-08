import React from 'react';
import { useOracleNetwork, useOraclePriceAggregation } from '@/hooks/useOracleNetwork';
import { usePriceHistory, useProviderMetrics, usePriceTrend } from '@/hooks/useOracleAdvanced';
import { OracleHealthDashboard } from '@/components/OracleHealthDashboard';
import { PriceAggregationCard } from '@/components/PriceAggregationCard';
import { OracleNetworkStatus } from '@/components/OracleNetworkStatus';
import { ProviderComparisonView } from '@/components/ProviderComparisonView';
import { PriceFormatter } from '@/utils/oraclePriceFormatter';

export const SimpleOraclePriceDisplay: React.FC<{ marketId: string }> = ({ marketId }) => {
  const { aggregatedPrice, loading, error } = useOraclePriceAggregation(marketId);

  if (loading) return <div>Loading price...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!aggregatedPrice) return <div>No price data available</div>;

  const formatted = PriceFormatter.formatAggregatedPrice(aggregatedPrice);

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{marketId}</h3>
      <p className="text-3xl font-bold">{formatted.formatted}</p>
      <p className="text-sm text-gray-600 mt-2">
        Status: {formatted.status}
      </p>
    </div>
  );
};

export const PriceWithTrendAnalysis: React.FC<{ marketId: string }> = ({ marketId }) => {
  const { aggregatedPrice } = useOraclePriceAggregation(marketId);
  const { history, analysis } = usePriceHistory(marketId);
  const trend = usePriceTrend(history);

  if (!aggregatedPrice || !trend) return <div>Loading...</div>;

  const formatted = PriceFormatter.formatAggregatedPrice(aggregatedPrice);

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Price</h3>
        <p className="text-3xl font-bold">{formatted.formatted}</p>
      </div>

      {trend && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
          <p className="text-lg">
            Direction: <span className="font-bold capitalize">{trend.direction}</span>
          </p>
          <p className="text-lg">
            Strength: {PriceFormatter.formatPercentage(trend.strength, 1)}
          </p>
          <p className="text-sm text-gray-600">
            Confidence: {PriceFormatter.formatConfidence(trend.confidence)}
          </p>
        </div>
      )}

      {analysis && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">High</p>
              <p className="font-bold">{analysis.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low</p>
              <p className="font-bold">{analysis.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="font-bold">{analysis.average.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Volatility</p>
              <p className="font-bold">{analysis.volatility.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ComprehensiveOracleDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <OracleNetworkStatus />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <OracleHealthDashboard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ProviderComparisonView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceAggregationCard
          marketId="STX/USD"
          showSources={true}
        />
        <PriceAggregationCard
          marketId="BTC/USD"
          showSources={true}
        />
      </div>
    </div>
  );
};

export const MarketPriceWidget: React.FC<{
  marketId: string;
  showHistory?: boolean;
  showAnalysis?: boolean;
}> = ({ marketId, showHistory = false, showAnalysis = false }) => {
  const { aggregatedPrice, sourcePrices, loading } = useOraclePriceAggregation(marketId);
  const { history } = usePriceHistory(marketId);

  if (loading) {
    return <div className="animate-pulse">Loading {marketId}...</div>;
  }

  if (!aggregatedPrice) {
    return <div className="text-red-600">Failed to load price for {marketId}</div>;
  }

  const formatted = PriceFormatter.formatAggregatedPrice(aggregatedPrice);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-600 uppercase">{marketId}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-2">{formatted.formatted}</p>

      <div className="mt-4 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            aggregatedPrice.consensusReached ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        ></div>
        <span className="text-xs text-gray-500">
          {aggregatedPrice.consensusReached ? 'Consensus' : 'No consensus'}
        </span>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">History: {history.length} prices</p>
        </div>
      )}

      {showAnalysis && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Confidence: {PriceFormatter.formatConfidence(aggregatedPrice.confidence)}
          </p>
        </div>
      )}
    </div>
  );
};

export const ProviderStatusWidget: React.FC = () => {
  const { metrics, loading, error } = useProviderMetrics();

  if (loading) return <div>Loading provider status...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const healthy = metrics.filter((m) => m.healthScore >= 0.8).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Status</h3>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-bold text-green-600">{healthy}</p>
          <p className="text-sm text-gray-600">Healthy</p>
        </div>
        <div className="text-gray-300">|</div>
        <div>
          <p className="text-3xl font-bold text-gray-600">{metrics.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>
    </div>
  );
};

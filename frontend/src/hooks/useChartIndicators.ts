import { useCallback } from 'react';
import { Candlestick, TechnicalIndicator } from '@/types/charting';
import { TechnicalIndicatorCalculator } from '@/services/TechnicalIndicatorCalculator';

interface UseChartIndicatorsProps {
  candles: Candlestick[];
  indicators: TechnicalIndicator[];
  indicatorCalculator: TechnicalIndicatorCalculator;
  onIndicatorsChange: (indicators: TechnicalIndicator[]) => void;
}

export function useChartIndicators({
  candles,
  indicators,
  indicatorCalculator,
  onIndicatorsChange,
}: UseChartIndicatorsProps) {
  const addIndicator = useCallback((type: string) => {
    let newIndicators: TechnicalIndicator[] = [];

    const ohlcv = candles.map(c => ({ ...c, time: c.time, volume: c.volume }));

    switch (type) {
      case 'SMA20':
        newIndicators = [
          {
            name: 'SMA20',
            type: 'line',
            color: '#2196F3',
            values: indicatorCalculator.calculateSMA(ohlcv, 20),
            visible: true,
          },
        ];
        break;
      case 'EMA12':
        newIndicators = [
          {
            name: 'EMA12',
            type: 'line',
            color: '#FF9800',
            values: indicatorCalculator.calculateEMA(ohlcv, 12),
            visible: true,
          },
        ];
        break;
      case 'RSI':
        newIndicators = [
          {
            name: 'RSI',
            type: 'line',
            color: '#9C27B0',
            values: indicatorCalculator.calculateRSI(ohlcv),
            visible: true,
          },
        ];
        break;
      case 'MACD':
        newIndicators = indicatorCalculator.calculateMACD(ohlcv);
        break;
      case 'Stochastic':
        newIndicators = indicatorCalculator.calculateStochastic(ohlcv);
        break;
      case 'ADX':
        newIndicators = indicatorCalculator.calculateADX(ohlcv);
        break;
    }

    onIndicatorsChange([...indicators, ...newIndicators]);
  }, [candles, indicators, indicatorCalculator, onIndicatorsChange]);

  const removeIndicator = useCallback((name: string) => {
    onIndicatorsChange(indicators.filter(ind => ind.name !== name));
  }, [indicators, onIndicatorsChange]);

  return { addIndicator, removeIndicator };
}

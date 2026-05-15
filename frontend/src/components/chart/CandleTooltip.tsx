import React from 'react';
import { Candlestick } from '@/types/charting';

interface CandleTooltipProps {
  candle: Candlestick | null;
}

export function CandleTooltip({ candle }: CandleTooltipProps) {
  if (!candle) return null;

  return (
    <div className="candle-tooltip">
      <div>Open: {candle.open.toFixed(2)}</div>
      <div>High: {candle.high.toFixed(2)}</div>
      <div>Low: {candle.low.toFixed(2)}</div>
      <div>Close: {candle.close.toFixed(2)}</div>
      <div>Volume: {candle.volume.toLocaleString()}</div>
    </div>
  );
}

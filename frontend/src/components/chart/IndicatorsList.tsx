import React from 'react';
import { TechnicalIndicator } from '@/types/charting';

interface IndicatorsListProps {
  indicators: TechnicalIndicator[];
  onRemoveIndicator: (name: string) => void;
}

export function IndicatorsList({ indicators, onRemoveIndicator }: IndicatorsListProps) {
  if (indicators.length === 0) return null;

  return (
    <div className="indicators-list">
      <h4>Indicators</h4>
      {indicators.map(ind => (
        <div key={ind.name} className="indicator-item">
          <span>{ind.name}</span>
          <button onClick={() => onRemoveIndicator(ind.name)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

import React, { useState } from 'react';

interface CandlestickLegendProps {
  priceScale: { min: number; max: number };
  volume: { min: number; max: number };
  timeframe: string;
  candleCount: number;
}

export function CandlestickLegend({
  priceScale,
  volume,
  timeframe,
  candleCount,
}: CandlestickLegendProps) {
  return (
    <div className="candlestick-legend">
      <div className="legend-item">
        <span className="label">Price Range:</span>
        <span className="value">
          {priceScale.min.toFixed(2)} - {priceScale.max.toFixed(2)}
        </span>
      </div>
      <div className="legend-item">
        <span className="label">Volume Range:</span>
        <span className="value">
          {volume.min.toLocaleString()} - {volume.max.toLocaleString()}
        </span>
      </div>
      <div className="legend-item">
        <span className="label">Timeframe:</span>
        <span className="value">{timeframe}</span>
      </div>
      <div className="legend-item">
        <span className="label">Candles:</span>
        <span className="value">{candleCount}</span>
      </div>
    </div>
  );
}

interface TechnicalIndicatorLegendProps {
  indicators: Array<{
    name: string;
    value: number;
    signal?: string;
    color?: string;
  }>;
  onToggleIndicator?: (name: string) => void;
}

export function TechnicalIndicatorLegend({
  indicators,
  onToggleIndicator,
}: TechnicalIndicatorLegendProps) {
  return (
    <div className="indicator-legend">
      <h4>Indicators</h4>
      {indicators.map(indicator => (
        <div
          key={indicator.name}
          className="indicator-item"
          onClick={() => onToggleIndicator?.(indicator.name)}
        >
          <div className="indicator-header">
            {indicator.color && (
              <div
                className="indicator-color"
                style={{ backgroundColor: indicator.color }}
              />
            )}
            <span className="indicator-name">{indicator.name}</span>
          </div>
          <div className="indicator-value">{indicator.value.toFixed(4)}</div>
          {indicator.signal && (
            <div className={`indicator-signal signal-${indicator.signal.toLowerCase()}`}>
              {indicator.signal}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface DrawingToolsLegendProps {
  tools: Array<{
    id: string;
    type: string;
    label?: string;
    color: string;
    visible: boolean;
  }>;
  onToggleVisibility?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function DrawingToolsLegend({
  tools,
  onToggleVisibility,
  onRemove,
}: DrawingToolsLegendProps) {
  return (
    <div className="drawing-tools-legend">
      <h4>Drawing Tools ({tools.length})</h4>
      {tools.length === 0 ? (
        <div className="no-tools">No tools</div>
      ) : (
        tools.map(tool => (
          <div key={tool.id} className="tool-item">
            <input
              type="checkbox"
              checked={tool.visible}
              onChange={() => onToggleVisibility?.(tool.id)}
            />
            <div
              className="tool-color"
              style={{ backgroundColor: tool.color }}
            />
            <span className="tool-type">{tool.type}</span>
            {tool.label && <span className="tool-label">({tool.label})</span>}
            {onRemove && (
              <button
                className="remove-btn"
                onClick={() => onRemove(tool.id)}
              >
                ×
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

interface VolumeLegendProps {
  currentVolume: number;
  averageVolume: number;
  peakVolume: number;
  volumeColor: string;
}

export function VolumeLegend({
  currentVolume,
  averageVolume,
  peakVolume,
  volumeColor,
}: VolumeLegendProps) {
  return (
    <div className="volume-legend">
      <div className="legend-item">
        <span className="label">Current:</span>
        <span className="value">{currentVolume.toLocaleString()}</span>
      </div>
      <div className="legend-item">
        <span className="label">Average:</span>
        <span className="value">{averageVolume.toLocaleString()}</span>
      </div>
      <div className="legend-item">
        <span className="label">Peak:</span>
        <span className="value">{peakVolume.toLocaleString()}</span>
      </div>
      <div className="volume-indicator">
        <div
          className="volume-bar"
          style={{ backgroundColor: volumeColor }}
        />
      </div>
    </div>
  );
}

interface ChartLegendProps {
  title?: string;
  items: Array<{
    label: string;
    value: string | number;
    color?: string;
    bold?: boolean;
  }>;
}

export function ChartLegend({ title, items }: ChartLegendProps) {
  return (
    <div className="chart-legend">
      {title && <h4>{title}</h4>}
      <div className="legend-items">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`legend-item ${item.bold ? 'bold' : ''}`}
          >
            {item.color && (
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="label">{item.label}:</span>
            <span className="value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CrosshairLegendProps {
  price: number;
  time: string;
  candleData?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export function CrosshairLegend({
  price,
  time,
  candleData,
}: CrosshairLegendProps) {
  return (
    <div className="crosshair-legend">
      <div className="time-info">{time}</div>
      <div className="price-info">{price.toFixed(4)}</div>
      {candleData && (
        <div className="candle-info">
          <div className="info-row">
            <span>O:</span>
            <span>{candleData.open.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span>H:</span>
            <span>{candleData.high.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span>L:</span>
            <span>{candleData.low.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span>C:</span>
            <span>{candleData.close.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

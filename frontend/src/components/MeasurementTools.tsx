import React, { useState, useRef } from 'react';
import { CrosshairTool, MeasurementTool, MeasurementData } from '@/services/ChartZoomPanService';

interface CrosshairToolComponentProps {
  enabled: boolean;
  onPositionChange?: (x: number, y: number) => void;
  onPriceTimeData?: (data: { price: number; time: string }) => void;
}

export function CrosshairToolComponent({
  enabled,
  onPositionChange,
  onPriceTimeData,
}: CrosshairToolComponentProps) {
  const crosshairRef = useRef(new CrosshairTool());
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    crosshairRef.current.setPosition(x, y);
    setPosition({ x, y });
    onPositionChange?.(x, y);
  };

  const handleMouseEnter = () => {
    if (enabled) {
      crosshairRef.current.show();
    }
  };

  const handleMouseLeave = () => {
    crosshairRef.current.hide();
  };

  return (
    <div
      className="crosshair-tool"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {enabled && (
        <div className="crosshair-values">
          <div className="value-row">
            <span>X: {position.x.toFixed(0)}</span>
            <span>Y: {position.y.toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface MeasurementToolComponentProps {
  enabled: boolean;
  priceRange: { min: number; max: number };
  timeRange: { start: string; end: string };
  onMeasurementComplete?: (data: MeasurementData) => void;
}

export function MeasurementToolComponent({
  enabled,
  priceRange,
  timeRange,
  onMeasurementComplete,
}: MeasurementToolComponentProps) {
  const measurementRef = useRef(new MeasurementTool());
  const [isActive, setIsActive] = useState(false);
  const [measurement, setMeasurement] = useState<MeasurementData | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    measurementRef.current.startMeasurement(x, y);
    setIsActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !enabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    measurementRef.current.updateMeasurement(x, y);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    measurementRef.current.updateMeasurement(x, y);
    measurementRef.current.endMeasurement();

    const data = measurementRef.current.getMeasurementData(priceRange, timeRange);
    if (data) {
      setMeasurement(data);
      onMeasurementComplete?.(data);
    }

    setIsActive(false);
  };

  return (
    <div
      className="measurement-tool"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {measurement && (
        <div className="measurement-display">
          <h4>Measurement</h4>
          <div className="measurement-item">
            <span>From Price:</span>
            <span>{measurement.fromPrice.toFixed(4)}</span>
          </div>
          <div className="measurement-item">
            <span>To Price:</span>
            <span>{measurement.toPrice.toFixed(4)}</span>
          </div>
          <div className="measurement-item">
            <span>Price Diff:</span>
            <span>{measurement.priceDifference.toFixed(4)}</span>
          </div>
          <div className="measurement-item">
            <span>% Change:</span>
            <span className={measurement.percentChange >= 0 ? 'positive' : 'negative'}>
              {measurement.percentChange.toFixed(2)}%
            </span>
          </div>
          <div className="measurement-item">
            <span>Time From:</span>
            <span>{measurement.fromTime}</span>
          </div>
          <div className="measurement-item">
            <span>Time To:</span>
            <span>{measurement.toTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface MeasurementToolbarProps {
  onToggleCrosshair: (enabled: boolean) => void;
  onToggleMeasurement: (enabled: boolean) => void;
  isCrosshairEnabled: boolean;
  isMeasurementEnabled: boolean;
  onClearMeasurements?: () => void;
}

export function MeasurementToolbar({
  onToggleCrosshair,
  onToggleMeasurement,
  isCrosshairEnabled,
  isMeasurementEnabled,
  onClearMeasurements,
}: MeasurementToolbarProps) {
  return (
    <div className="measurement-toolbar">
      <button
        className={`tool-btn ${isCrosshairEnabled ? 'active' : ''}`}
        onClick={() => onToggleCrosshair(!isCrosshairEnabled)}
        title="Crosshair Tool"
      >
        ✚ Crosshair
      </button>
      <button
        className={`tool-btn ${isMeasurementEnabled ? 'active' : ''}`}
        onClick={() => onToggleMeasurement(!isMeasurementEnabled)}
        title="Measurement Tool"
      >
        📏 Measure
      </button>
      {onClearMeasurements && (
        <button
          className="tool-btn clear-btn"
          onClick={onClearMeasurements}
          title="Clear Measurements"
        >
          Clear
        </button>
      )}
    </div>
  );
}

interface CoordinateDisplayProps {
  x: number;
  y: number;
  price?: number;
  time?: string;
}

export function CoordinateDisplay({ x, y, price, time }: CoordinateDisplayProps) {
  return (
    <div className="coordinate-display">
      <div className="coord-row">
        <span className="label">X:</span>
        <span className="value">{x.toFixed(0)}</span>
      </div>
      <div className="coord-row">
        <span className="label">Y:</span>
        <span className="value">{y.toFixed(0)}</span>
      </div>
      {price !== undefined && (
        <div className="coord-row">
          <span className="label">Price:</span>
          <span className="value">{price.toFixed(4)}</span>
        </div>
      )}
      {time && (
        <div className="coord-row">
          <span className="label">Time:</span>
          <span className="value">{time}</span>
        </div>
      )}
    </div>
  );
}

interface PriceLevelDisplayProps {
  level: number;
  label?: string;
  color?: string;
  isDraggable?: boolean;
  onDrag?: (newPrice: number) => void;
}

export function PriceLevelDisplay({
  level,
  label,
  color = '#999999',
  isDraggable = false,
  onDrag,
}: PriceLevelDisplayProps) {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = () => {
    if (isDraggable) {
      setIsActive(true);
    }
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  return (
    <div
      className={`price-level ${isActive ? 'active' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        borderTopColor: color,
        cursor: isDraggable ? 'grab' : 'default',
      }}
    >
      <span className="price">{level.toFixed(4)}</span>
      {label && <span className="label">{label}</span>}
    </div>
  );
}

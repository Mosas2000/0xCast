import type { JsonValue } from './common';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Candlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color: 'green' | 'red';
}

export interface IndicatorValue {
  time: number;
  value: number | number[] | null;
}

export interface TechnicalIndicator {
  name: string;
  type: 'line' | 'histogram' | 'area';
  color: string;
  values: IndicatorValue[];
  visible: boolean;
}

export interface ChartConfig {
  width: number;
  height: number;
  timeframe: Timeframe;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  candleColor: { up: string; down: string };
}

export interface DrawingTool {
  id: string;
  type: 'line' | 'rectangle' | 'triangle' | 'circle' | 'freehand' | 'trendline';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  visible: boolean;
  label?: string;
}

export interface ChartData {
  marketId: string;
  symbol: string;
  candles: Candlestick[];
  indicators: TechnicalIndicator[];
  drawingTools: DrawingTool[];
  currentPrice: number;
  priceChangePercent: number;
}

export interface CandlePoint {
  x: number;
  y: number;
  candle: Candlestick;
}

export interface VolumeData {
  time: number;
  volume: number;
  color: 'green' | 'red';
}

export interface ChartScale {
  minPrice: number;
  maxPrice: number;
  minTime: number;
  maxTime: number;
  pricePerPixel: number;
  timePerPixel: number;
}

export interface IndicatorSettings {
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, number | string>;
}

export interface ChartState {
  candles: Candlestick[];
  indicators: TechnicalIndicator[];
  drawingTools: DrawingTool[];
  selectedTimeframe: Timeframe;
  isLoading: boolean;
  error: string | null;
  scale: ChartScale;
  hoveredCandle: Candlestick | null;
  selectedDrawingTool: DrawingTool | null;
}

export interface PriceLevel {
  level: number;
  label: string;
  color: string;
  width: number;
}

export interface CandleStyle {
  upColor: string;
  downColor: string;
  borderWidth: number;
  wickWidth: number;
}

export interface VolumeBarStyle {
  upColor: string;
  downColor: string;
  showVolume: boolean;
  volumeHeight: number;
}

export interface AnalysisPattern {
  name: string;
  type: string;
  candles: Candlestick[];
  strength: number;
  bullish: boolean;
}

export interface ChartEvent {
  type: 'candle_hover' | 'candle_click' | 'timeframe_change' | 'indicator_add' | 'indicator_remove' | 'tool_add' | 'tool_remove';
  data: JsonValue;
  timestamp: number;
}

export interface RealTimeUpdate {
  marketId: string;
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  volume: number;
  timestamp: number;
  highDay: number;
  lowDay: number;
}

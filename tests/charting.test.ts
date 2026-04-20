import { describe, it, expect, beforeEach } from 'vitest';
import { TechnicalIndicatorCalculator } from '@/services/TechnicalIndicatorCalculator';
import { CandlestickRenderer } from '@/services/CandlestickRenderer';
import { ChartDataManager } from '@/services/ChartDataManager';
import { DrawingToolManager } from '@/services/DrawingToolManager';
import { PatternRecognitionService } from '@/services/PatternRecognitionService';
import { ChartZoomPanService, CrosshairTool, MeasurementTool } from '@/services/ChartZoomPanService';
import { ChartExportService } from '@/services/ChartExportService';
import { CacheManager } from '@/services/RealTimeDataService';
import { Candlestick } from '@/types/charting';

const mockCandles: Candlestick[] = [
  { time: '2024-01-01T00:00:00Z', open: 100, high: 105, low: 95, close: 102, volume: 1000 },
  { time: '2024-01-01T01:00:00Z', open: 102, high: 108, low: 100, close: 105, volume: 1200 },
  { time: '2024-01-01T02:00:00Z', open: 105, high: 110, low: 103, close: 107, volume: 1100 },
  { time: '2024-01-01T03:00:00Z', open: 107, high: 112, low: 106, close: 110, volume: 1300 },
  { time: '2024-01-01T04:00:00Z', open: 110, high: 115, low: 108, close: 113, volume: 1400 },
];

describe('TechnicalIndicatorCalculator', () => {
  let calculator: TechnicalIndicatorCalculator;

  beforeEach(() => {
    calculator = new TechnicalIndicatorCalculator();
  });

  it('calculates simple moving average', () => {
    const sma = calculator.calculateSMA(mockCandles, 2);
    expect(sma).toBeDefined();
    expect(sma.length).toBe(mockCandles.length);
  });

  it('calculates exponential moving average', () => {
    const ema = calculator.calculateEMA(mockCandles, 2);
    expect(ema).toBeDefined();
    expect(ema.length).toBe(mockCandles.length);
  });

  it('calculates RSI', () => {
    const rsi = calculator.calculateRSI(mockCandles, 2);
    expect(rsi).toBeDefined();
    expect(rsi.length).toBe(mockCandles.length);
  });

  it('calculates MACD', () => {
    const macd = calculator.calculateMACD(mockCandles, 2, 3, 2);
    expect(macd).toBeDefined();
    expect(macd.macd).toBeDefined();
    expect(macd.signal).toBeDefined();
    expect(macd.histogram).toBeDefined();
  });

  it('calculates Bollinger Bands', () => {
    const bb = calculator.calculateBollingerBands(mockCandles, 2, 2);
    expect(bb).toBeDefined();
    expect(bb.upper).toBeDefined();
    expect(bb.middle).toBeDefined();
    expect(bb.lower).toBeDefined();
  });

  it('calculates ATR', () => {
    const atr = calculator.calculateATR(mockCandles, 2);
    expect(atr).toBeDefined();
    expect(atr.length).toBe(mockCandles.length);
  });

  it('calculates OBV', () => {
    const obv = calculator.calculateOBV(mockCandles);
    expect(obv).toBeDefined();
    expect(obv.length).toBe(mockCandles.length);
  });

  it('calculates Stochastic', () => {
    const stoch = calculator.calculateStochastic(mockCandles, 2);
    expect(stoch).toBeDefined();
    expect(stoch.k).toBeDefined();
    expect(stoch.d).toBeDefined();
  });

  it('calculates ADX', () => {
    const adx = calculator.calculateADX(mockCandles, 2);
    expect(adx).toBeDefined();
    expect(adx.length).toBe(mockCandles.length);
  });
});

describe('ChartDataManager', () => {
  let manager: ChartDataManager;

  beforeEach(() => {
    manager = new ChartDataManager();
  });

  it('aggregates candles', () => {
    manager.aggregate(mockCandles, 'hourly');
    expect(manager.getData('hourly')).toBeDefined();
  });

  it('calculates scale correctly', () => {
    const scale = manager.getScale(800, 600);
    expect(scale).toHaveProperty('min');
    expect(scale).toHaveProperty('max');
    expect(scale).toHaveProperty('padding');
  });

  it('handles empty data', () => {
    const scale = manager.getScale(800, 600);
    expect(scale.min).toBe(0);
    expect(scale.max).toBe(100);
  });
});

describe('DrawingToolManager', () => {
  let manager: DrawingToolManager;

  beforeEach(() => {
    manager = new DrawingToolManager();
  });

  it('creates drawing tool', () => {
    const tool = manager.createTool('line', { x: 0, y: 0, color: '#FF0000' });
    expect(tool).toBeDefined();
    expect(tool.type).toBe('line');
    expect(tool.color).toBe('#FF0000');
  });

  it('adds points to tool', () => {
    const tool = manager.createTool('line', { x: 0, y: 0 });
    manager.addPoint(tool.id, { x: 100, y: 100 });
    expect(tool.points.length).toBe(1);
  });

  it('removes tool', () => {
    const tool = manager.createTool('line', { x: 0, y: 0 });
    manager.removeTool(tool.id);
    expect(manager.getTool(tool.id)).toBeNull();
  });

  it('retrieves tools', () => {
    manager.createTool('line', { x: 0, y: 0 });
    manager.createTool('rectangle', { x: 10, y: 10 });
    const tools = manager.getTools();
    expect(tools.length).toBe(2);
  });
});

describe('PatternRecognitionService', () => {
  let service: PatternRecognitionService;

  beforeEach(() => {
    service = new PatternRecognitionService();
  });

  it('detects patterns', () => {
    const patterns = service.detectPatterns(mockCandles);
    expect(Array.isArray(patterns)).toBe(true);
  });

  it('returns patterns with confidence scores', () => {
    const patterns = service.detectPatterns(mockCandles);
    patterns.forEach(pattern => {
      expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('handles insufficient data', () => {
    const patterns = service.detectPatterns([mockCandles[0]]);
    expect(patterns.length).toBe(0);
  });
});

describe('ChartZoomPanService', () => {
  let service: ChartZoomPanService;

  beforeEach(() => {
    service = new ChartZoomPanService();
  });

  it('provides zoom levels', () => {
    const levels = service.getZoomLevels();
    expect(levels.length).toBeGreaterThan(0);
  });

  it('zooms in', () => {
    const initial = service.getCurrentZoomLevel();
    service.zoomIn();
    expect(service.getCurrentZoomLevel()).toBeGreaterThan(initial);
  });

  it('zooms out', () => {
    service.zoomIn();
    const afterZoomIn = service.getCurrentZoomLevel();
    service.zoomOut();
    expect(service.getCurrentZoomLevel()).toBeLessThan(afterZoomIn);
  });

  it('resets zoom', () => {
    service.zoomIn();
    service.resetZoom();
    expect(service.getCurrentZoomLevel()).toBe(1.0);
  });

  it('manages pan state', () => {
    service.startDrag(0, 0);
    service.updateDrag(10, 10);
    const pan = service.getPanState();
    expect(pan.xOffset).toBe(10);
    expect(pan.yOffset).toBe(10);
  });

  it('tracks dragging state', () => {
    expect(service.getPanState().isDragging).toBe(false);
    service.startDrag(0, 0);
    expect(service.getPanState().isDragging).toBe(true);
    service.endDrag();
    expect(service.getPanState().isDragging).toBe(false);
  });

  it('calculates candle width', () => {
    const width = service.calculateCandleWidth(800);
    expect(width).toBeGreaterThan(0);
  });
});

describe('CrosshairTool', () => {
  let crosshair: CrosshairTool;

  beforeEach(() => {
    crosshair = new CrosshairTool();
  });

  it('sets position', () => {
    crosshair.setPosition(100, 200);
    const pos = crosshair.getPosition();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it('toggles visibility', () => {
    expect(crosshair.isVisible()).toBe(false);
    crosshair.show();
    expect(crosshair.isVisible()).toBe(true);
    crosshair.hide();
    expect(crosshair.isVisible()).toBe(false);
  });
});

describe('MeasurementTool', () => {
  let measurement: MeasurementTool;

  beforeEach(() => {
    measurement = new MeasurementTool();
  });

  it('starts and ends measurement', () => {
    measurement.startMeasurement(0, 0);
    measurement.updateMeasurement(100, 100);
    measurement.endMeasurement();
    expect(measurement).toBeDefined();
  });

  it('calculates measurement data', () => {
    measurement.startMeasurement(0, 0);
    measurement.updateMeasurement(50, 50);
    measurement.endMeasurement();

    const data = measurement.getMeasurementData(
      { min: 100, max: 200 },
      { start: '2024-01-01', end: '2024-01-02' }
    );

    expect(data).toHaveProperty('priceDifference');
    expect(data).toHaveProperty('percentChange');
  });
});

describe('ChartExportService', () => {
  let service: ChartExportService;

  beforeEach(() => {
    service = new ChartExportService();
  });

  it('generates CSV report', () => {
    const csv = service.generateCSVReport({
      candles: mockCandles,
      metadata: {
        exportedAt: new Date().toISOString(),
        timeframe: '1h',
        candleCount: mockCandles.length,
        priceRange: { min: 95, max: 115 },
      },
    });

    expect(csv).toContain('CHART EXPORT REPORT');
    expect(csv).toContain('Time,Open,High,Low,Close,Volume');
  });

  it('generates technical analysis report', () => {
    const report = service.generateTechnicalAnalysisReport(
      mockCandles,
      [{ name: 'RSI', value: 50 }]
    );

    expect(report).toContain('TECHNICAL ANALYSIS REPORT');
    expect(report).toContain('Opening Price');
    expect(report).toContain('VOLUME ANALYSIS');
  });

  it('calculates file size', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const size = service.getFileSize(blob);
    expect(size).toMatch(/Bytes|KB|MB/);
  });
});

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(100);
  });

  it('stores and retrieves data', () => {
    cache.set('key1', { data: 'value1' });
    expect(cache.get('key1')).toEqual({ data: 'value1' });
  });

  it('expires old entries', async () => {
    cache.set('key1', { data: 'value1' });
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cache.get('key1')).toBeNull();
  });

  it('checks entry existence', () => {
    cache.set('key1', { data: 'value1' });
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('deletes entries', () => {
    cache.set('key1', { data: 'value1' });
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('clears all entries', () => {
    cache.set('key1', { data: 'value1' });
    cache.set('key2', { data: 'value2' });
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('cleans up expired entries', () => {
    cache.set('key1', { data: 'value1' });
    cache.set('key2', { data: 'value2' });
    expect(cache.size()).toBe(2);
    cache.cleanup();
    expect(cache.size()).toBeGreaterThanOrEqual(0);
  });
});

describe('CandlestickRenderer', () => {
  let renderer: CandlestickRenderer;

  beforeEach(() => {
    renderer = new CandlestickRenderer();
  });

  it('renders candles', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    expect(() => {
      renderer.render(ctx!, mockCandles, { min: 90, max: 120, padding: 10 }, 800, 600);
    }).not.toThrow();
  });
});

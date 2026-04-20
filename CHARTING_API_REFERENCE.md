# Charting System API Reference

## Types

### Candlestick

```typescript
interface Candlestick {
  time: string;        // ISO 8601 timestamp
  open: number;        // Opening price
  high: number;        // Highest price
  low: number;         // Lowest price
  close: number;       // Closing price
  volume: number;      // Trading volume
}
```

### TechnicalIndicator

```typescript
interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'trend' | 'momentum' | 'volatility' | 'volume';
  value: number | Record<string, number>;
  signal?: 'buy' | 'sell' | 'neutral';
  overbought?: number;
  oversold?: number;
  parameters: Record<string, number>;
}
```

### DrawingTool

```typescript
interface DrawingTool {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'triangle' | 'freehand' | 'trendline';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  visible: boolean;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}
```

### ChartScale

```typescript
interface ChartScale {
  min: number;
  max: number;
  padding: number;
}
```

### Timeframe

```typescript
type Timeframe =
  | '1m' | '5m' | '15m' | '30m'
  | '1h' | '4h'
  | 'daily' | 'weekly' | 'monthly';
```

### ChartPattern

```typescript
interface ChartPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
  targetPrice?: number;
  stopLoss?: number;
}
```

## Services

### TechnicalIndicatorCalculator

#### calculateSMA(candles: Candlestick[], period: number): number[]

Calculate Simple Moving Average.

```typescript
const sma20 = calculator.calculateSMA(candles, 20);
```

#### calculateEMA(candles: Candlestick[], period: number): number[]

Calculate Exponential Moving Average.

```typescript
const ema12 = calculator.calculateEMA(candles, 12);
```

#### calculateRSI(candles: Candlestick[], period: number): number[]

Calculate Relative Strength Index (0-100).

```typescript
const rsi = calculator.calculateRSI(candles, 14);
```

#### calculateMACD(candles: Candlestick[], fast: number, slow: number, signal: number)

Calculate MACD with signal line and histogram.

```typescript
const macd = calculator.calculateMACD(candles, 12, 26, 9);
// Returns: { macd: number[], signal: number[], histogram: number[] }
```

#### calculateBollingerBands(candles: Candlestick[], period: number, stdDev: number)

Calculate Bollinger Bands with upper, middle, and lower bands.

```typescript
const bb = calculator.calculateBollingerBands(candles, 20, 2);
// Returns: { upper: number[], middle: number[], lower: number[] }
```

#### calculateStochastic(candles: Candlestick[], period: number)

Calculate Stochastic Oscillator.

```typescript
const stoch = calculator.calculateStochastic(candles, 14);
// Returns: { k: number[], d: number[] }
```

#### calculateATR(candles: Candlestick[], period: number): number[]

Calculate Average True Range.

```typescript
const atr = calculator.calculateATR(candles, 14);
```

#### calculateOBV(candles: Candlestick[]): number[]

Calculate On-Balance Volume.

```typescript
const obv = calculator.calculateOBV(candles);
```

#### calculateADX(candles: Candlestick[], period: number): number[]

Calculate Average Directional Index.

```typescript
const adx = calculator.calculateADX(candles, 14);
```

### CandlestickRenderer

#### render(ctx: CanvasRenderingContext2D, candles: Candlestick[], scale: ChartScale, width: number, height: number)

Render candlesticks on canvas.

```typescript
renderer.render(ctx, candles, scale, 800, 600);
```

#### renderCandle(ctx: CanvasRenderingContext2D, candle: Candlestick, index: number, scale: ChartScale, candleWidth: number)

Render individual candlestick.

```typescript
renderer.renderCandle(ctx, candle, 0, scale, 10);
```

#### renderVolumeBar(ctx: CanvasRenderingContext2D, volume: number, index: number, maxVolume: number, x: number, y: number, height: number)

Render volume bar.

```typescript
renderer.renderVolumeBar(ctx, 1000, 0, 2000, 50, 400, 100);
```

#### highlightCandle(ctx: CanvasRenderingContext2D, index: number, scale: ChartScale, width: number, height: number, color?: string)

Highlight specific candle.

```typescript
renderer.highlightCandle(ctx, 5, scale, 800, 600, '#FFFF00');
```

### ChartDataManager

#### aggregate(candles: Candlestick[], timeframe: Timeframe): void

Aggregate candles to timeframe.

```typescript
manager.aggregate(minuteCandles, 'hourly');
```

#### getData(timeframe: Timeframe): Candlestick[]

Get aggregated candles.

```typescript
const hourlyCandles = manager.getData('hourly');
```

#### getScale(width: number, height: number): ChartScale

Calculate scale from current data.

```typescript
const scale = manager.getScale(800, 600);
```

#### getPaddedScale(width: number, height: number, padding: number): ChartScale

Calculate scale with padding.

```typescript
const scale = manager.getPaddedScale(800, 600, 10);
```

### DrawingToolManager

#### createTool(type: DrawingTool['type'], options: Partial<DrawingTool>): DrawingTool

Create new drawing tool.

```typescript
const line = manager.createTool('line', {
  x: 100,
  y: 200,
  color: '#FF0000',
  width: 2,
});
```

#### addPoint(toolId: string, point: { x: number; y: number }): boolean

Add point to tool.

```typescript
manager.addPoint(line.id, { x: 300, y: 400 });
```

#### removePoint(toolId: string, index: number): boolean

Remove point from tool.

```typescript
manager.removePoint(line.id, 0);
```

#### removeTool(toolId: string): boolean

Remove tool.

```typescript
manager.removeTool(line.id);
```

#### getTool(toolId: string): DrawingTool | null

Get tool by ID.

```typescript
const tool = manager.getTool(line.id);
```

#### getTools(): DrawingTool[]

Get all tools.

```typescript
const tools = manager.getTools();
```

#### updateTool(toolId: string, updates: Partial<DrawingTool>): boolean

Update tool properties.

```typescript
manager.updateTool(line.id, { color: '#00FF00' });
```

#### render(ctx: CanvasRenderingContext2D, scale: ChartScale, width: number, height: number): void

Render all tools.

```typescript
manager.render(ctx, scale, 800, 600);
```

### PatternRecognitionService

#### detectPatterns(candles: Candlestick[]): ChartPattern[]

Detect all patterns.

```typescript
const patterns = service.detectPatterns(candles);
patterns.forEach(p => {
  console.log(`${p.name}: ${(p.confidence * 100).toFixed(1)}%`);
});
```

### ChartZoomPanService

#### getZoomLevels(): ZoomLevel[]

Get available zoom levels.

```typescript
const levels = service.getZoomLevels();
```

#### getCurrentZoomLevel(): number

Get current zoom level.

```typescript
const zoom = service.getCurrentZoomLevel();
```

#### setZoomLevel(level: number): ChartScale | null

Set zoom to specific level.

```typescript
service.setZoomLevel(2.0);
```

#### zoomIn(): number

Zoom in one level.

```typescript
const newZoom = service.zoomIn();
```

#### zoomOut(): number

Zoom out one level.

```typescript
const newZoom = service.zoomOut();
```

#### resetZoom(): number

Reset zoom to 100%.

```typescript
service.resetZoom();
```

#### handleMouseWheel(deltaY: number, centerX?: number, centerY?: number): { zoom: number; pan: PanState }

Handle mouse wheel events.

```typescript
const result = service.handleMouseWheel(-120, 400, 300);
```

#### startDrag(x: number, y: number): void

Start pan drag.

```typescript
service.startDrag(100, 200);
```

#### updateDrag(x: number, y: number): PanState

Update drag position.

```typescript
const pan = service.updateDrag(150, 250);
```

#### endDrag(): PanState

End drag.

```typescript
service.endDrag();
```

#### resetPan(): PanState

Reset pan to origin.

```typescript
service.resetPan();
```

#### getPanState(): PanState

Get current pan state.

```typescript
const pan = service.getPanState();
```

#### calculateCandleWidth(containerWidth: number): number

Calculate width per candle.

```typescript
const width = service.calculateCandleWidth(800);
```

#### getVisibleCandleCount(): number

Get number of visible candles at current zoom.

```typescript
const count = service.getVisibleCandleCount();
```

### ChartExportService

#### exportAsImage(canvas: HTMLCanvasElement, options: ExportOptions): Promise<Blob>

Export canvas as image.

```typescript
await service.exportAsImage(canvas, {
  format: 'png',
  filename: 'chart',
  resolution: 'high',
});
```

#### exportAsData(data: ExportData, options: ExportOptions): Promise<Blob>

Export data as CSV or JSON.

```typescript
await service.exportAsData(chartData, {
  format: 'csv',
  filename: 'market-data',
});
```

#### generateCSVReport(data: ExportData): string

Generate CSV report string.

```typescript
const csv = service.generateCSVReport(data);
```

#### generateTechnicalAnalysisReport(candles: Candlestick[], indicators: TechnicalIndicator[]): string

Generate analysis report.

```typescript
const report = service.generateTechnicalAnalysisReport(candles, indicators);
```

#### copyImageToClipboard(canvas: HTMLCanvasElement): Promise<void>

Copy canvas image to clipboard.

```typescript
await service.copyImageToClipboard(canvas);
```

### RealTimeDataService

#### connect(): Promise<void>

Connect WebSocket.

```typescript
await service.connect();
```

#### disconnect(): void

Disconnect WebSocket.

```typescript
service.disconnect();
```

#### subscribe(event: string, callback: Function): void

Subscribe to event.

```typescript
service.subscribe('candle_update', (candle) => {
  console.log('Updated:', candle);
});
```

#### unsubscribe(event: string, callback: Function): void

Unsubscribe from event.

```typescript
service.unsubscribe('candle_update', handler);
```

#### isConnectedToServer(): boolean

Check connection status.

```typescript
if (service.isConnectedToServer()) {
  // Connected
}
```

### PollingDataService

#### startPolling(fetchFunction: () => Promise<Candlestick[]>, interval?: number): void

Start polling for data.

```typescript
service.startPolling(async () => {
  return await fetchCandlesFromAPI();
}, 1000);
```

#### stopPolling(): void

Stop polling.

```typescript
service.stopPolling();
```

#### subscribe(event: string, callback: Function): void

Subscribe to updates.

```typescript
service.subscribe('update', (candles) => {
  console.log('Data updated');
});
```

#### getLastUpdateTime(): number

Get timestamp of last update.

```typescript
const time = service.getLastUpdateTime();
```

#### getUpdateAge(): number

Get age of last update in milliseconds.

```typescript
const age = service.getUpdateAge();
```

### CacheManager

#### set(key: string, data: any): void

Store data in cache.

```typescript
cache.set('candles_1h', candleData);
```

#### get(key: string): any

Retrieve data from cache.

```typescript
const data = cache.get('candles_1h');
```

#### has(key: string): boolean

Check if key exists.

```typescript
if (cache.has('candles_1h')) {
  // Use cached data
}
```

#### delete(key: string): void

Remove specific key.

```typescript
cache.delete('candles_1h');
```

#### clear(): void

Clear all cache.

```typescript
cache.clear();
```

#### cleanup(): void

Remove expired entries.

```typescript
cache.cleanup();
```

#### size(): number

Get cache size.

```typescript
const size = cache.size();
```

## React Hooks

### useAdvancedChart

```typescript
const {
  candles,
  indicators,
  scale,
  zoomLevel,
  addIndicator,
  removeIndicator,
  zoomIn,
  zoomOut,
  setCandles,
  refreshData,
} = useAdvancedChart(config);
```

### useTechnicalIndicators

```typescript
const {
  indicators,
  addIndicator,
  removeIndicator,
  updateIndicator,
  getIndicatorData,
} = useTechnicalIndicators(candles);
```

### useDrawingTools

```typescript
const {
  tools,
  addTool,
  removeTool,
  updateTool,
  isDrawing,
  startDrawing,
  stopDrawing,
} = useDrawingTools();
```

### useChartZoomPan

```typescript
const {
  zoom,
  pan,
  zoomIn,
  zoomOut,
  resetZoom,
  handleDrag,
  handleMouseWheel,
} = useChartZoomPan();
```

## Component Props

All component props are fully typed with TypeScript interfaces in `frontend/src/types/charting.ts`.

See CHARTING_GUIDE.md for detailed component documentation and examples.

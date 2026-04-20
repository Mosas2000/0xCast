# Advanced Charting and Technical Analysis Tools

Professional charting system with technical indicators, drawing tools, and real-time data support.

## Overview

The advanced charting system provides:
- Candlestick charts with OHLCV data
- 8 technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic, ATR, OBV, ADX)
- Drawing tools (line, rectangle, circle, triangle, freehand, trendline)
- Pattern recognition (head & shoulders, triangles, wedges, double tops/bottoms)
- Real-time WebSocket and polling data updates
- Mobile-responsive interface with touch gestures
- Chart export (PNG, SVG, CSV, JSON)
- Measurement and crosshair tools
- Responsive zoom and pan controls

## Architecture

### Core Services

#### TechnicalIndicatorCalculator
Computes technical indicators from candlestick data.

**Indicators:**
- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Stochastic Oscillator
- Average True Range (ATR)
- On-Balance Volume (OBV)
- Average Directional Index (ADX)

**Usage:**
```typescript
const calculator = new TechnicalIndicatorCalculator();
const sma = calculator.calculateSMA(candles, 20);
const rsi = calculator.calculateRSI(candles, 14);
const macd = calculator.calculateMACD(candles, 12, 26, 9);
```

#### CandlestickRenderer
Renders candlesticks and volume bars on HTML5 Canvas.

**Features:**
- High-performance canvas rendering
- Customizable candle appearance
- Volume bar visualization
- Candle highlighting
- Scale-aware rendering

**Usage:**
```typescript
const renderer = new CandlestickRenderer();
renderer.render(ctx, candles, scale, width, height);
renderer.highlightCandle(ctx, candleIndex, scale, width, height);
```

#### ChartDataManager
Aggregates and manages chart data with caching.

**Features:**
- Data aggregation across timeframes
- Scale calculations
- Caching for performance
- Gap handling

**Usage:**
```typescript
const manager = new ChartDataManager();
manager.aggregate(candles, 'daily');
const scale = manager.getScale(width, height);
```

#### DrawingToolManager
Manages creation, storage, and rendering of drawing tools.

**Tools:**
- Line
- Rectangle
- Circle
- Triangle
- Freehand
- Trendline

**Usage:**
```typescript
const manager = new DrawingToolManager();
const tool = manager.createTool('line', { x: 100, y: 50 });
manager.addPoint(tool.id, { x: 200, y: 100 });
manager.render(ctx, scale);
```

#### PatternRecognitionService
Detects chart patterns and technical formations.

**Patterns:**
- Head and Shoulders
- Triangles
- Wedges
- Double Top/Bottom
- Flags
- Pennants

**Usage:**
```typescript
const service = new PatternRecognitionService();
const patterns = service.detectPatterns(candles);
patterns.forEach(pattern => {
  console.log(`${pattern.name}: ${pattern.confidence}`);
});
```

#### ChartZoomPanService
Manages zoom levels, pan states, and measurement tools.

**Features:**
- 8 zoom levels (50% to 500%)
- Smooth pan control
- Mouse wheel zoom
- Crosshair tool
- Measurement tool

**Usage:**
```typescript
const service = new ChartZoomPanService();
service.zoomIn();
service.startDrag(x, y);
service.updateDrag(x, y);
```

#### ChartExportService
Exports charts and data in multiple formats.

**Formats:**
- PNG (image)
- SVG (vector)
- CSV (data)
- JSON (data)

**Usage:**
```typescript
const service = new ChartExportService();
await service.exportAsImage(canvas, { format: 'png' });
await service.exportAsData(data, { format: 'csv' });
```

#### RealTimeDataService
WebSocket-based real-time data streaming.

**Features:**
- Automatic reconnection with exponential backoff
- Heartbeat/ping-pong
- Event-based updates
- Connection state tracking

**Usage:**
```typescript
const service = new RealTimeDataService({ url: 'ws://...' });
await service.connect();
service.subscribe('candle_update', (candle) => {
  console.log('Updated:', candle);
});
```

#### PollingDataService
Polling-based data updates as WebSocket fallback.

**Features:**
- Configurable poll interval
- Error handling
- Update tracking

**Usage:**
```typescript
const service = new PollingDataService(1000);
service.startPolling(async () => {
  return await fetchCandles();
});
```

### React Hooks

#### useAdvancedChart
Main hook for chart management.

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
} = useAdvancedChart({
  candleSource: source,
  defaultIndicators: ['SMA', 'RSI'],
});
```

#### useTechnicalIndicators
Manage technical indicators.

```typescript
const {
  indicators,
  addIndicator,
  removeIndicator,
  updateIndicator,
  getIndicatorData,
} = useTechnicalIndicators(candles);
```

#### useDrawingTools
Manage drawing tools.

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

#### useChartZoomPan
Manage zoom and pan state.

```typescript
const {
  zoom,
  pan,
  zoomIn,
  zoomOut,
  resetZoom,
  handleDrag,
} = useChartZoomPan();
```

### React Components

#### AdvancedChart
Main chart component with full feature set.

**Props:**
```typescript
interface AdvancedChartProps {
  candles: Candlestick[];
  width?: number;
  height?: number;
  timeframe?: string;
  enableDrawingTools?: boolean;
  enableIndicators?: boolean;
  onCandleClick?: (candle: Candlestick) => void;
  realTimeUpdates?: boolean;
  websocketUrl?: string;
}
```

#### PriceOverlay
Real-time price ticker and volume spike alerts.

**Features:**
- Current price display
- Price change percentage
- Volume spike detection
- Color-coded signals

#### TimeframeSelector
Select and switch between timeframes.

**Timeframes:**
- 1m, 5m, 15m, 30m
- 1h, 4h, daily
- Weekly, monthly

#### IndicatorPanel
Manage technical indicators.

**Features:**
- Add/remove indicators
- Adjust parameters
- View signal interpretation

#### DrawingToolsPanel
Manage drawing tools and annotations.

**Features:**
- Select drawing tool
- Manage active tools
- Customize colors and appearance

#### MeasurementTools
Crosshair and measurement tools.

**Features:**
- Precise price/time identification
- Distance measurements
- Price level annotations

#### ResponsiveChart
Mobile-responsive wrapper.

**Features:**
- Breakpoint-aware layout
- Touch gesture support
- Adaptive controls

## Usage Examples

### Basic Chart Setup

```typescript
import { AdvancedChart } from '@/components/AdvancedChart';

export function MarketChart() {
  const [candles, setCandles] = useState<Candlestick[]>([]);

  useEffect(() => {
    loadCandles();
  }, []);

  return (
    <AdvancedChart
      candles={candles}
      width={800}
      height={600}
      timeframe="1h"
      enableIndicators
      enableDrawingTools
    />
  );
}
```

### With Real-Time Updates

```typescript
<AdvancedChart
  candles={candles}
  realTimeUpdates={true}
  websocketUrl="wss://data.example.com/market"
/>
```

### Mobile Responsive

```typescript
import { ResponsiveChartWrapper } from '@/components/ResponsiveChart';

<ResponsiveChartWrapper onBreakpointChange={handleBreakpoint}>
  <AdvancedChart candles={candles} />
</ResponsiveChartWrapper>
```

### With Custom Indicators

```typescript
const { addIndicator, indicators } = useTechnicalIndicators(candles);

addIndicator('RSI', { period: 14 });
addIndicator('MACD', { fast: 12, slow: 26, signal: 9 });
```

### Pattern Detection

```typescript
const service = new PatternRecognitionService();
const patterns = service.detectPatterns(candles);

patterns.forEach(pattern => {
  if (pattern.confidence > 0.7) {
    console.log(`High-confidence ${pattern.name} detected`);
  }
});
```

### Export Functionality

```typescript
const exportService = new ChartExportService();

const canvasRef = useRef<HTMLCanvasElement>(null);
await exportService.exportAsImage(canvasRef.current, {
  format: 'png',
  filename: 'chart',
});
```

## Performance Considerations

- Canvas rendering optimized for 1000+ candles
- Indicator calculations use efficient algorithms
- Drawing tools use path caching
- Data aggregation reduces memory usage
- Zoom level adjusts visible candle count

## Mobile Support

- Touch gesture recognition
- Compact toolbar layouts
- Responsive font sizing
- Optimized canvas rendering
- Gesture-based zoom and pan

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## Type Definitions

All components and services include full TypeScript support with comprehensive type definitions in `frontend/src/types/charting.ts`.

## Configuration

Chart behavior can be customized through:
- Candle styling
- Indicator parameters
- Drawing tool appearance
- Zoom level bounds
- Performance parameters

# Charting System Integration Guide

## Overview

This guide explains how to integrate the advanced charting system into your application.

## Installation

All charting components are located in:
- `frontend/src/components/` - React components
- `frontend/src/services/` - Business logic services
- `frontend/src/types/charting.ts` - TypeScript definitions

## Basic Integration

### 1. Import Components and Services

```typescript
import { AdvancedChart } from '@/components/AdvancedChart';
import { TechnicalIndicatorCalculator } from '@/services/TechnicalIndicatorCalculator';
import { Candlestick } from '@/types/charting';
```

### 2. Prepare Candlestick Data

```typescript
const candles: Candlestick[] = [
  {
    time: '2024-01-01T00:00:00Z',
    open: 100.0,
    high: 105.0,
    low: 95.0,
    close: 102.0,
    volume: 1000000,
  },
  // ... more candles
];
```

### 3. Render Chart

```typescript
<AdvancedChart
  candles={candles}
  width={800}
  height={600}
  timeframe="1h"
  enableIndicators={true}
  enableDrawingTools={true}
/>
```

## Advanced Integration

### Real-Time Data Streaming

```typescript
import { RealTimeDataService } from '@/services/RealTimeDataService';

const dataService = new RealTimeDataService({
  url: 'wss://api.example.com/market',
  heartbeatInterval: 30000,
  reconnectDelay: 3000,
});

await dataService.connect();

dataService.subscribe('candle_update', (candle: Candlestick) => {
  // Update chart with new candle
  setCandles(prev => {
    const copy = [...prev];
    copy[copy.length - 1] = candle;
    return copy;
  });
});
```

### Custom Indicator Integration

```typescript
import { useTechnicalIndicators } from '@/hooks/useChartingHooks';

export function ChartWithIndicators() {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  
  const { indicators, addIndicator } = useTechnicalIndicators(candles);

  return (
    <div>
      <AdvancedChart candles={candles} />
      <IndicatorPanel
        indicators={indicators}
        onAdd={(name) => addIndicator(name)}
      />
    </div>
  );
}
```

### Drawing Tool Integration

```typescript
import { useDrawingTools } from '@/hooks/useChartingHooks';

export function ChartWithDrawing() {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  
  const { tools, addTool, removeTool } = useDrawingTools();

  return (
    <AdvancedChart
      candles={candles}
      drawingTools={tools}
      onAddTool={(type) => addTool(type)}
      onRemoveTool={(id) => removeTool(id)}
    />
  );
}
```

### Mobile Responsive Integration

```typescript
import { ResponsiveChartWrapper } from '@/components/ResponsiveChart';

export function ResponsiveMarketChart() {
  const [breakpoint, setBreakpoint] = useState('desktop');

  return (
    <ResponsiveChartWrapper
      onBreakpointChange={setBreakpoint}
    >
      <AdvancedChart
        candles={candles}
        isCompact={breakpoint === 'mobile'}
      />
    </ResponsiveChartWrapper>
  );
}
```

## Data Flow

```
Data Source (WebSocket/API)
  ↓
RealTimeDataService / PollingDataService
  ↓
ChartDataManager (aggregation & caching)
  ↓
TechnicalIndicatorCalculator
  ↓
CandlestickRenderer / DrawingToolManager
  ↓
React Components (AdvancedChart, etc.)
```

## Service Architecture

### TechnicalIndicatorCalculator

Calculate indicators for technical analysis:

```typescript
const calculator = new TechnicalIndicatorCalculator();

const sma20 = calculator.calculateSMA(candles, 20);
const ema12 = calculator.calculateEMA(candles, 12);
const rsi14 = calculator.calculateRSI(candles, 14);
const macd = calculator.calculateMACD(candles, 12, 26, 9);
const bb = calculator.calculateBollingerBands(candles, 20, 2);
const stoch = calculator.calculateStochastic(candles, 14);
const atr = calculator.calculateATR(candles, 14);
const obv = calculator.calculateOBV(candles);
const adx = calculator.calculateADX(candles, 14);
```

### CandlestickRenderer

Render candlesticks and volume:

```typescript
const renderer = new CandlestickRenderer();

// Render candles
renderer.render(
  canvasContext,
  candles,
  scale,
  width,
  height,
  volume
);

// Highlight specific candle
renderer.highlightCandle(
  canvasContext,
  candleIndex,
  scale,
  width,
  height,
  '#FFFF00'
);
```

### ChartDataManager

Aggregate data across timeframes:

```typescript
const manager = new ChartDataManager();

manager.aggregate(minuteCandles, 'hourly');
const hourlyCandles = manager.getData('hourly');

const scale = manager.getScale(width, height);
const paddedScale = manager.getPaddedScale(width, height, 10);
```

### DrawingToolManager

Create and manage drawing tools:

```typescript
const toolManager = new DrawingToolManager();

// Create tool
const line = toolManager.createTool('line', {
  x: 100,
  y: 200,
  color: '#FF0000',
  width: 2,
});

// Add points
toolManager.addPoint(line.id, { x: 300, y: 400 });

// Remove point
toolManager.removePoint(line.id, 0);

// Render
toolManager.render(canvasContext, scale, width, height);

// Get tools
const allTools = toolManager.getTools();
```

### PatternRecognitionService

Detect technical patterns:

```typescript
const patternService = new PatternRecognitionService();

const patterns = patternService.detectPatterns(candles);

patterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.name}`);
  console.log(`Type: ${pattern.type}`); // bullish, bearish, neutral
  console.log(`Confidence: ${pattern.confidence}`);
  console.log(`Target: ${pattern.targetPrice}`);
});
```

### ChartZoomPanService

Manage zoom and pan:

```typescript
const zoomPanService = new ChartZoomPanService();

// Zoom
zoomPanService.zoomIn();
zoomPanService.zoomOut();
zoomPanService.setZoomLevel(2.0);
const levels = zoomPanService.getZoomLevels();

// Pan
zoomPanService.startDrag(100, 200);
zoomPanService.updateDrag(150, 250);
zoomPanService.endDrag();
zoomPanService.resetPan();

// Mouse wheel zoom
const result = zoomPanService.handleMouseWheel(deltaY, centerX, centerY);

// Fit view
zoomPanService.fitToView(dataWidth, dataHeight, containerWidth, containerHeight);

// Crosshair
const crosshair = new CrosshairTool();
crosshair.show();
crosshair.setPosition(x, y);
crosshair.render(ctx, width, height);

// Measurement
const measurement = new MeasurementTool();
measurement.startMeasurement(x1, y1);
measurement.updateMeasurement(x2, y2);
measurement.endMeasurement();
const data = measurement.getMeasurementData(priceRange, timeRange);
```

### ChartExportService

Export charts and data:

```typescript
const exportService = new ChartExportService();

// Export as image
await exportService.exportAsImage(canvas, {
  format: 'png',
  filename: 'my-chart',
});

// Export as data
await exportService.exportAsData(chartData, {
  format: 'csv',
  filename: 'market-data',
});

// Copy to clipboard
await exportService.copyImageToClipboard(canvas);

// Generate reports
const csvReport = exportService.generateCSVReport(data);
const analysisReport = exportService.generateTechnicalAnalysisReport(
  candles,
  indicators
);
```

### RealTimeDataService

Stream real-time data via WebSocket:

```typescript
const rtService = new RealTimeDataService({
  url: 'wss://api.example.com/market',
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
});

// Connect
await rtService.connect();

// Subscribe to events
rtService.subscribe('candle_update', (candle) => {
  console.log('Candle updated:', candle);
});

rtService.subscribe('candle_new', (candle) => {
  console.log('New candle:', candle);
});

rtService.subscribe('price_update', (data) => {
  console.log('Price updated:', data.price);
});

rtService.subscribe('error', (error) => {
  console.error('Stream error:', error);
});

// Check connection
if (rtService.isConnectedToServer()) {
  // Connected
}

// Disconnect
rtService.disconnect();
```

### PollingDataService

Fallback polling-based data:

```typescript
const pollService = new PollingDataService(1000); // 1 second interval

// Start polling
pollService.startPolling(
  async () => {
    return await fetchCandlesFromAPI();
  },
  2000 // 2 second poll interval
);

// Subscribe
pollService.subscribe('update', (candles) => {
  console.log('Data updated:', candles);
});

// Stop polling
pollService.stopPolling();

// Track updates
const age = pollService.getUpdateAge();
```

## State Management

### With React Hooks

```typescript
import { useAdvancedChart } from '@/hooks/useChartingHooks';

function MyChart() {
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
  } = useAdvancedChart({
    candleSource: async () => fetchCandles(),
    defaultIndicators: ['SMA', 'RSI'],
    autoRefresh: true,
  });

  return (
    <AdvancedChart
      candles={candles}
      indicators={indicators}
      zoomLevel={zoomLevel}
    />
  );
}
```

### With Redux/Zustand

```typescript
// Define slices for chart state
const chartSlice = createSlice({
  name: 'chart',
  initialState: {
    candles: [],
    indicators: [],
    zoomLevel: 1.0,
  },
  reducers: {
    setCandles: (state, action) => {
      state.candles = action.payload;
    },
    addIndicator: (state, action) => {
      state.indicators.push(action.payload);
    },
    setZoom: (state, action) => {
      state.zoomLevel = action.payload;
    },
  },
});
```

## Error Handling

```typescript
try {
  await dataService.connect();
} catch (error) {
  console.error('Failed to connect:', error);
  // Fallback to polling
  pollService.startPolling(fetchCandles);
}

dataService.subscribe('error', (error) => {
  console.error('Stream error:', error);
  // Handle stream errors
});
```

## Performance Optimization

```typescript
// Use memoization for expensive calculations
const memoizedIndicators = useMemo(
  () => calculateIndicators(candles),
  [candles]
);

// Debounce resize events
const debouncedResize = useMemo(
  () => debounce(handleResize, 300),
  []
);

// Limit rendered candles
const visibleCandles = useMemo(
  () => candles.slice(-100), // Show last 100 only
  [candles, zoomLevel]
);
```

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import { AdvancedChart } from '@/components/AdvancedChart';

describe('AdvancedChart', () => {
  it('renders candles', () => {
    const candles = [{ /* ... */ }];
    render(<AdvancedChart candles={candles} />);
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });

  it('handles indicator addition', async () => {
    // Test indicator logic
  });

  it('renders drawing tools', () => {
    // Test drawing tools
  });
});
```

## Accessibility

- Canvas elements have proper ARIA labels
- Keyboard navigation support
- Screen reader compatible components
- Color contrast compliance
- Touch gesture alternatives

## Browser Support

- Desktop: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Android Chrome 90+

## Next Steps

1. Integrate with your data API
2. Configure real-time streaming
3. Customize indicator parameters
4. Style components for your brand
5. Set up error handling and logging

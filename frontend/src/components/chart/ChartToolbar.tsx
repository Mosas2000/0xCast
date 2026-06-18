import type { Timeframe, DrawingTool } from '@/types/charting';

interface ChartToolbarProps {
  timeframe: Timeframe;
  isDrawingMode: boolean;
  drawingToolsCount: number;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onAddIndicator: (type: string) => void;
  onStartDrawing: (toolType: DrawingTool['type']) => void;
  onStopDrawing: () => void;
  onClearTools: () => void;
}

export function ChartToolbar({
  timeframe,
  isDrawingMode,
  drawingToolsCount,
  onTimeframeChange,
  onAddIndicator,
  onStartDrawing,
  onStopDrawing,
  onClearTools,
}: ChartToolbarProps) {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

  return (
    <div className="chart-toolbar">
      <div className="timeframe-selector">
        {timeframes.map(tf => (
          <button
            key={tf}
            className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
            onClick={() => onTimeframeChange(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="indicator-controls">
        <button onClick={() => onAddIndicator('SMA20')}>SMA 20</button>
        <button onClick={() => onAddIndicator('EMA12')}>EMA 12</button>
        <button onClick={() => onAddIndicator('RSI')}>RSI</button>
        <button onClick={() => onAddIndicator('MACD')}>MACD</button>
        <button onClick={() => onAddIndicator('Stochastic')}>Stochastic</button>
        <button onClick={() => onAddIndicator('ADX')}>ADX</button>
      </div>

      <div className="drawing-tools">
        <button onClick={() => onStartDrawing('line')}>Line</button>
        <button onClick={() => onStartDrawing('rectangle')}>Rectangle</button>
        <button onClick={() => onStartDrawing('circle')}>Circle</button>
        <button onClick={() => onStartDrawing('trendline')}>Trendline</button>
        <button onClick={() => onStartDrawing('freehand')}>Freehand</button>
        {isDrawingMode && (
          <button onClick={onStopDrawing} className="stop-btn">
            Stop Drawing
          </button>
        )}
        {drawingToolsCount > 0 && (
          <button onClick={onClearTools} className="clear-btn">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

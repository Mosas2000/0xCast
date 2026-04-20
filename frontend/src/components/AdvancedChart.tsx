import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Candlestick, ChartScale, Timeframe, TechnicalIndicator, DrawingTool } from '@/types/charting';
import { CandlestickRenderer } from '@/services/CandlestickRenderer';
import { ChartDataManager } from '@/services/ChartDataManager';
import { TechnicalIndicatorCalculator } from '@/services/TechnicalIndicatorCalculator';
import { DrawingToolManager } from '@/services/DrawingToolManager';

interface AdvancedChartProps {
  candles: Candlestick[];
  onTimeframeChange?: (timeframe: Timeframe) => void;
  width?: number;
  height?: number;
  showVolume?: boolean;
  responsive?: boolean;
}

export function AdvancedChart({
  candles,
  onTimeframeChange,
  width = 1000,
  height = 600,
  showVolume = true,
  responsive = true,
}: AdvancedChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [drawingTools, setDrawingTools] = useState<DrawingTool[]>([]);
  const [scale, setScale] = useState<ChartScale | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candlestick | null>(null);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<DrawingTool | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const dataManagerRef = useRef(new ChartDataManager());
  const rendererRef = useRef<CandlestickRenderer | null>(null);
  const drawingManagerRef = useRef(new DrawingToolManager());
  const indicatorCalculatorRef = useRef(new TechnicalIndicatorCalculator());

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    if (responsive && containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    rendererRef.current = new CandlestickRenderer(canvas, {
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderWidth: 1,
      wickWidth: 1,
    });

    const newScale = dataManagerRef.current.calculateScale(candles, 0.1);
    setScale(newScale);
  }, [width, height, responsive]);

  useEffect(() => {
    if (!canvasRef.current || !rendererRef.current || !scale) return;

    rendererRef.current.render(candles, scale);

    if (hoveredCandle) {
      rendererRef.current.highlightCandle(0, hoveredCandle, scale);
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      drawingManagerRef.current.renderTools(ctx, scale, canvasRef.current.height);
    }
  }, [candles, scale, hoveredCandle]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !scale) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const price = scale.minPrice + (1 - y / canvasRef.current.height) * (scale.maxPrice - scale.minPrice);
    const hoveredCandle = dataManagerRef.current.findCandleAtPrice(candles, price);

    if (hoveredCandle) {
      setHoveredCandle(hoveredCandle);
    }

    if (isDrawingMode && selectedDrawingTool) {
      drawingManagerRef.current.addPoint(x, y);
    }
  }, [candles, scale, isDrawingMode, selectedDrawingTool]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !scale) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawingMode) {
      const tool = drawingManagerRef.current.finalizeTool();
      if (tool) {
        setDrawingTools([...drawingTools, tool]);
      }
    }
  }, [drawingTools, isDrawingMode]);

  const addIndicator = (type: string) => {
    let newIndicators: TechnicalIndicator[] = [];

    const ohlcv = candles.map(c => ({ ...c, time: c.time, volume: c.volume }));

    switch (type) {
      case 'SMA20':
        newIndicators = [
          {
            name: 'SMA20',
            type: 'line',
            color: '#2196F3',
            values: indicatorCalculatorRef.current.calculateSMA(ohlcv, 20),
            visible: true,
          },
        ];
        break;
      case 'EMA12':
        newIndicators = [
          {
            name: 'EMA12',
            type: 'line',
            color: '#FF9800',
            values: indicatorCalculatorRef.current.calculateEMA(ohlcv, 12),
            visible: true,
          },
        ];
        break;
      case 'RSI':
        newIndicators = [
          {
            name: 'RSI',
            type: 'line',
            color: '#9C27B0',
            values: indicatorCalculatorRef.current.calculateRSI(ohlcv),
            visible: true,
          },
        ];
        break;
      case 'MACD':
        newIndicators = indicatorCalculatorRef.current.calculateMACD(ohlcv);
        break;
      case 'Stochastic':
        newIndicators = indicatorCalculatorRef.current.calculateStochastic(ohlcv);
        break;
      case 'ADX':
        newIndicators = indicatorCalculatorRef.current.calculateADX(ohlcv);
        break;
    }

    setIndicators([...indicators, ...newIndicators]);
  };

  const removeIndicator = (name: string) => {
    setIndicators(indicators.filter(ind => ind.name !== name));
  };

  const startDrawing = (toolType: DrawingTool['type']) => {
    setIsDrawingMode(true);
    const tool = drawingManagerRef.current.addTool(toolType);
    setSelectedDrawingTool(tool);
  };

  const stopDrawing = () => {
    setIsDrawingMode(false);
    setSelectedDrawingTool(null);
  };

  const clearAllTools = () => {
    drawingManagerRef.current.clearTools();
    setDrawingTools([]);
  };

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  return (
    <div className="advanced-chart-container" ref={containerRef}>
      <div className="chart-toolbar">
        <div className="timeframe-selector">
          {(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="indicator-controls">
          <button onClick={() => addIndicator('SMA20')}>SMA 20</button>
          <button onClick={() => addIndicator('EMA12')}>EMA 12</button>
          <button onClick={() => addIndicator('RSI')}>RSI</button>
          <button onClick={() => addIndicator('MACD')}>MACD</button>
          <button onClick={() => addIndicator('Stochastic')}>Stochastic</button>
          <button onClick={() => addIndicator('ADX')}>ADX</button>
        </div>

        <div className="drawing-tools">
          <button onClick={() => startDrawing('line')}>Line</button>
          <button onClick={() => startDrawing('rectangle')}>Rectangle</button>
          <button onClick={() => startDrawing('circle')}>Circle</button>
          <button onClick={() => startDrawing('trendline')}>Trendline</button>
          <button onClick={() => startDrawing('freehand')}>Freehand</button>
          {isDrawingMode && <button onClick={stopDrawing} className="stop-btn">Stop Drawing</button>}
          {drawingTools.length > 0 && <button onClick={clearAllTools} className="clear-btn">Clear</button>}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="chart-canvas"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
      />

      {hoveredCandle && (
        <div className="candle-tooltip">
          <div>Open: {hoveredCandle.open.toFixed(2)}</div>
          <div>High: {hoveredCandle.high.toFixed(2)}</div>
          <div>Low: {hoveredCandle.low.toFixed(2)}</div>
          <div>Close: {hoveredCandle.close.toFixed(2)}</div>
          <div>Volume: {hoveredCandle.volume.toLocaleString()}</div>
        </div>
      )}

      <div className="indicators-list">
        <h4>Indicators</h4>
        {indicators.map(ind => (
          <div key={ind.name} className="indicator-item">
            <span>{ind.name}</span>
            <button onClick={() => removeIndicator(ind.name)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

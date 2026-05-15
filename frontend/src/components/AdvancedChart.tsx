import React, { useRef, useCallback } from 'react';
import { Candlestick, Timeframe } from '@/types/charting';
import { useChartState } from '@/hooks/useChartState';
import { useChartRendering } from '@/hooks/useChartRendering';
import { useChartIndicators } from '@/hooks/useChartIndicators';
import { useChartDrawing } from '@/hooks/useChartDrawing';
import { ChartToolbar } from './chart/ChartToolbar';
import { ChartCanvas } from './chart/ChartCanvas';
import { CandleTooltip } from './chart/CandleTooltip';
import { IndicatorsList } from './chart/IndicatorsList';

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

  const {
    timeframe,
    setTimeframe,
    indicators,
    setIndicators,
    drawingTools,
    setDrawingTools,
    scale,
    setScale,
    hoveredCandle,
    setHoveredCandle,
    selectedDrawingTool,
    setSelectedDrawingTool,
    isDrawingMode,
    setIsDrawingMode,
    dataManagerRef,
    drawingManagerRef,
    indicatorCalculatorRef,
  } = useChartState();

  useChartRendering({
    canvasRef,
    containerRef,
    width,
    height,
    responsive,
    candles,
    scale,
    hoveredCandle,
    dataManager: dataManagerRef.current,
    drawingManager: drawingManagerRef.current,
    onScaleChange: setScale,
  });

  const { addIndicator, removeIndicator } = useChartIndicators({
    candles,
    indicators,
    indicatorCalculator: indicatorCalculatorRef.current,
    onIndicatorsChange: setIndicators,
  });

  const { startDrawing, stopDrawing, clearAllTools, finalizeTool } = useChartDrawing({
    drawingTools,
    isDrawingMode,
    drawingManager: drawingManagerRef.current,
    onDrawingToolsChange: setDrawingTools,
    onDrawingModeChange: setIsDrawingMode,
    onSelectedToolChange: setSelectedDrawingTool,
  });

  const handleTimeframeChange = useCallback((newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  }, [setTimeframe, onTimeframeChange]);

  return (
    <div className="advanced-chart-container" ref={containerRef}>
      <ChartToolbar
        timeframe={timeframe}
        isDrawingMode={isDrawingMode}
        drawingToolsCount={drawingTools.length}
        onTimeframeChange={handleTimeframeChange}
        onAddIndicator={addIndicator}
        onStartDrawing={startDrawing}
        onStopDrawing={stopDrawing}
        onClearTools={clearAllTools}
      />

      <ChartCanvas
        canvasRef={canvasRef}
        candles={candles}
        scale={scale}
        isDrawingMode={isDrawingMode}
        selectedDrawingTool={selectedDrawingTool}
        dataManager={dataManagerRef.current}
        drawingManager={drawingManagerRef.current}
        onHoveredCandleChange={setHoveredCandle}
        onDrawingComplete={finalizeTool}
      />

      <CandleTooltip candle={hoveredCandle} />

      <IndicatorsList indicators={indicators} onRemoveIndicator={removeIndicator} />
    </div>
  );
}

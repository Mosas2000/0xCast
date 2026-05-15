import React, { useCallback } from 'react';
import { Candlestick, ChartScale, DrawingTool } from '@/types/charting';
import { ChartDataManager } from '@/services/ChartDataManager';
import { DrawingToolManager } from '@/services/DrawingToolManager';

interface ChartCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  candles: Candlestick[];
  scale: ChartScale | null;
  isDrawingMode: boolean;
  selectedDrawingTool: DrawingTool | null;
  dataManager: ChartDataManager;
  drawingManager: DrawingToolManager;
  onHoveredCandleChange: (candle: Candlestick | null) => void;
  onDrawingComplete: () => void;
}

export function ChartCanvas({
  canvasRef,
  candles,
  scale,
  isDrawingMode,
  selectedDrawingTool,
  dataManager,
  drawingManager,
  onHoveredCandleChange,
  onDrawingComplete,
}: ChartCanvasProps) {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !scale) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const price = scale.minPrice + (1 - y / canvasRef.current.height) * (scale.maxPrice - scale.minPrice);
    const hoveredCandle = dataManager.findCandleAtPrice(candles, price);

    if (hoveredCandle) {
      onHoveredCandleChange(hoveredCandle);
    }

    if (isDrawingMode && selectedDrawingTool) {
      drawingManager.addPoint(x, y);
    }
  }, [canvasRef, candles, scale, isDrawingMode, selectedDrawingTool, dataManager, drawingManager, onHoveredCandleChange]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !scale) return;

    if (isDrawingMode) {
      onDrawingComplete();
    }
  }, [canvasRef, scale, isDrawingMode, onDrawingComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="chart-canvas"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}

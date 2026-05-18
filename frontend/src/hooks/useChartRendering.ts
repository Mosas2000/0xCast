import { useEffect, useRef } from 'react';
import { Candlestick, ChartScale } from '@/types/charting';
import { CandlestickRenderer } from '@/services/CandlestickRenderer';

interface UseChartRenderingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
  height: number;
  responsive: boolean;
  candles: Candlestick[];
  scale: ChartScale | null;
  hoveredCandle: Candlestick | null;
  dataManager: any;
  drawingManager: any;
  onScaleChange: (scale: ChartScale) => void;
}

export function useChartRendering({
  canvasRef,
  containerRef,
  width,
  height,
  responsive,
  candles,
  scale,
  hoveredCandle,
  dataManager,
  drawingManager,
  onScaleChange,
}: UseChartRenderingProps) {
  const rendererRef = useRef<CandlestickRenderer | null>(null);

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

    const newScale = dataManager.calculateScale(candles, 0.1);
    onScaleChange(newScale);
  }, [width, height, responsive, candles, dataManager, onScaleChange]);

  useEffect(() => {
    if (!canvasRef.current || !rendererRef.current || !scale) return;

    rendererRef.current.render(candles, scale);

    if (hoveredCandle) {
      rendererRef.current.highlightCandle(0, hoveredCandle, scale);
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      drawingManager.renderTools(ctx, scale, canvasRef.current.height);
    }
  }, [candles, scale, hoveredCandle, drawingManager]);

  return { rendererRef };
}

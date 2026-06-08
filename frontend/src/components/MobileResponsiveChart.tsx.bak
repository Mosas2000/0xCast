import { useEffect, useRef, useState } from 'react';

interface MobileResponsiveChartProps {
  data: Array<{ x: number; y: number }>;
  title?: string;
  color?: string;
  height?: number;
}

export function MobileResponsiveChart({ 
  data, 
  title, 
  color = '#3B82F6',
  height = 200 
}: MobileResponsiveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0 || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const padding = 40;
    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;

    const minY = Math.min(...data.map(d => d.y));
    const maxY = Math.max(...data.map(d => d.y));
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));

    const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y: number) => dimensions.height - padding - ((y - minY) / (maxY - minY)) * chartHeight;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, padding, 0, dimensions.height - padding);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(scaleX(data[0].x), dimensions.height - padding);
    data.forEach(point => {
      ctx.lineTo(scaleX(point.x), scaleY(point.y));
    });
    ctx.lineTo(scaleX(data[data.length - 1].x), dimensions.height - padding);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(dimensions.width - padding, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = maxY - ((maxY - minY) / 4) * i;
      const y = padding + (chartHeight / 4) * i;
      ctx.fillText(value.toFixed(0), padding - 8, y + 4);
    }

  }, [data, dimensions, color]);

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {title}
        </h3>
      )}
      <canvas
        ref={canvasRef}
        className="w-full touch-none"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}

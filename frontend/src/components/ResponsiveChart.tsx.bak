import React, { useState, useEffect } from 'react';

interface ResponsiveChartProps {
  children: React.ReactNode;
  onBreakpointChange?: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void;
}

export function ResponsiveChartWrapper({
  children,
  onBreakpointChange,
}: ResponsiveChartProps) {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: 'mobile' | 'tablet' | 'desktop';

      if (width < 768) {
        newBreakpoint = 'mobile';
      } else if (width < 1024) {
        newBreakpoint = 'tablet';
      } else {
        newBreakpoint = 'desktop';
      }

      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
        onBreakpointChange?.(newBreakpoint);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint, onBreakpointChange]);

  return (
    <div className={`responsive-chart responsive-${breakpoint}`}>
      {children}
    </div>
  );
}

interface MobileChartControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onToggleIndicators?: () => void;
  onToggleDrawingTools?: () => void;
  currentZoom?: number;
}

export function MobileChartControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleIndicators,
  onToggleDrawingTools,
  currentZoom = 1.0,
}: MobileChartControlsProps) {
  return (
    <div className="mobile-chart-controls">
      <div className="control-group">
        <button
          className="control-btn"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="zoom-level">{(currentZoom * 100).toFixed(0)}%</span>
        <button
          className="control-btn"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      <button
        className="control-btn"
        onClick={onResetZoom}
        aria-label="Reset zoom"
      >
        Reset
      </button>

      <button
        className="control-btn"
        onClick={onToggleIndicators}
        aria-label="Toggle indicators"
      >
        📊
      </button>

      <button
        className="control-btn"
        onClick={onToggleDrawingTools}
        aria-label="Drawing tools"
      >
        ✏️
      </button>
    </div>
  );
}

interface TouchGestureHandlerProps {
  onPinch?: (scale: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onDoubleTap?: () => void;
  children: React.ReactNode;
}

export function TouchGestureHandler({
  onPinch,
  onPan,
  onDoubleTap,
  children,
}: TouchGestureHandlerProps) {
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [lastTapTime, setLastTapTime] = useState(0);

  const getDistance = (p1: Touch, p2: Touch): number => {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    } else if (e.touches.length === 1) {
      setInitialPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });

      const now = Date.now();
      if (now - lastTapTime < 300) {
        onDoubleTap?.();
      }
      setLastTapTime(now);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialDistance > 0) {
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = newDistance / initialDistance;
      onPinch?.(scale);
    } else if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - initialPosition.x;
      const deltaY = e.touches[0].clientY - initialPosition.y;
      onPan?.(deltaX, deltaY);
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(0);
  };

  return (
    <div
      className="touch-gesture-handler"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

interface CompactIndicatorPanelProps {
  indicators: Array<{ name: string; value: number }>;
  onIndicatorToggle?: (name: string) => void;
  onShowDetails?: (name: string) => void;
}

export function CompactIndicatorPanel({
  indicators,
  onIndicatorToggle,
  onShowDetails,
}: CompactIndicatorPanelProps) {
  return (
    <div className="compact-indicator-panel">
      <div className="indicators-summary">
        {indicators.slice(0, 3).map(indicator => (
          <button
            key={indicator.name}
            type="button"
            className="indicator-badge"
            onClick={() => onShowDetails?.(indicator.name)}
          >
            <span className="name">{indicator.name}</span>
            <span className="value">{indicator.value.toFixed(2)}</span>
          </button>
        ))}
        {indicators.length > 3 && (
          <div className="more-indicators">
            +{indicators.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

interface VerticalLayoutProps {
  chart: React.ReactNode;
  controls: React.ReactNode;
  indicators?: React.ReactNode;
}

export function VerticalChartLayout({
  chart,
  controls,
  indicators,
}: VerticalLayoutProps) {
  return (
    <div className="vertical-chart-layout">
      <div className="chart-area">{chart}</div>
      {indicators && <div className="indicators-area">{indicators}</div>}
      <div className="controls-area">{controls}</div>
    </div>
  );
}

interface HorizontalLayoutProps {
  chart: React.ReactNode;
  sidebar: React.ReactNode;
}

export function HorizontalChartLayout({
  chart,
  sidebar,
}: HorizontalLayoutProps) {
  return (
    <div className="horizontal-chart-layout">
      <div className="chart-area">{chart}</div>
      <div className="sidebar-area">{sidebar}</div>
    </div>
  );
}

interface FullscreenChartProps {
  isFullscreen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FullscreenChartContainer({
  isFullscreen,
  onToggle,
  children,
}: FullscreenChartProps) {
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <div className={`fullscreen-chart-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <button
        className="fullscreen-toggle"
        onClick={onToggle}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>
      {children}
    </div>
  );
}

interface AdaptiveToolbarProps {
  tools: Array<{ id: string; label: string; icon?: string }>;
  onToolSelect: (toolId: string) => void;
  isCompact?: boolean;
}

export function AdaptiveToolbar({
  tools,
  onToolSelect,
  isCompact = false,
}: AdaptiveToolbarProps) {
  return (
    <div className={`adaptive-toolbar ${isCompact ? 'compact' : ''}`}>
      {tools.map(tool => (
        <button
          key={tool.id}
          className="toolbar-tool"
          onClick={() => onToolSelect(tool.id)}
          title={tool.label}
        >
          {tool.icon && <span className="icon">{tool.icon}</span>}
          {!isCompact && <span className="label">{tool.label}</span>}
        </button>
      ))}
    </div>
  );
}

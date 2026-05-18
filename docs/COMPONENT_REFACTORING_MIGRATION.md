# Component Refactoring Migration Guide

This guide helps developers understand the changes made during the component refactoring and how to work with the new structure.

## What Changed

Two large components were refactored into smaller, more maintainable pieces:
- `AdvancedChart.tsx`
- `AdminRBACDashboard.tsx`

## Import Changes

### AdvancedChart

**Before:**
```typescript
import { AdvancedChart } from '@/components/AdvancedChart';
```

**After:**
The main component import remains the same, but if you need individual pieces:
```typescript
import { AdvancedChart } from '@/components/AdvancedChart';

// Or import sub-components directly
import { ChartToolbar, ChartCanvas, CandleTooltip, IndicatorsList } from '@/components/chart';

// Or import hooks
import { useChartState, useChartRendering, useChartIndicators, useChartDrawing } from '@/hooks';
```

### AdminRBACDashboard

**Before:**
```typescript
import { AdminRBACDashboard } from '@/components/AdminRBACDashboard';
```

**After:**
The main component import remains the same, but if you need individual pieces:
```typescript
import { AdminRBACDashboard } from '@/components/AdminRBACDashboard';

// Or import sub-components directly
import {
  DashboardHeader,
  DashboardNavigation,
  OverviewSection,
  RolesSection,
  AssignmentsSection,
  ResourcesSection,
  AuditSection,
  DashboardFooter
} from '@/components/rbac';

// Or import the hook
import { useRBACStatistics } from '@/hooks';
```

## API Compatibility

All component props remain unchanged. The refactoring is internal only, so existing usage continues to work without modifications.

### AdvancedChart Props
```typescript
interface AdvancedChartProps {
  candles: Candlestick[];
  onTimeframeChange?: (timeframe: Timeframe) => void;
  width?: number;
  height?: number;
  showVolume?: boolean;
  responsive?: boolean;
}
```

### AdminRBACDashboard Props
```typescript
interface AdminRBACSectionProps {
  accessControl: AccessControlService;
  roleAssignment: RoleAssignmentService;
  auditLogger: AuditLogger;
  roleHierarchy: RoleHierarchyManager;
  permissionMatrix: PermissionMatrixManager;
  currentUserId: string;
}
```

## Using Extracted Components

### Building Custom Chart Variants

You can now create custom chart implementations using the extracted components:

```typescript
import { useChartState, useChartRendering } from '@/hooks';
import { ChartCanvas, CandleTooltip } from '@/components/chart';

function SimpleChart({ candles }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
    scale,
    setScale,
    hoveredCandle,
    setHoveredCandle,
    dataManagerRef,
    drawingManagerRef,
  } = useChartState();

  useChartRendering({
    canvasRef,
    containerRef,
    width: 800,
    height: 400,
    responsive: true,
    candles,
    scale,
    hoveredCandle,
    dataManager: dataManagerRef.current,
    drawingManager: drawingManagerRef.current,
    onScaleChange: setScale,
  });

  return (
    <div ref={containerRef}>
      <ChartCanvas
        canvasRef={canvasRef}
        candles={candles}
        scale={scale}
        isDrawingMode={false}
        selectedDrawingTool={null}
        dataManager={dataManagerRef.current}
        drawingManager={drawingManagerRef.current}
        onHoveredCandleChange={setHoveredCandle}
        onDrawingComplete={() => {}}
      />
      <CandleTooltip candle={hoveredCandle} />
    </div>
  );
}
```

### Building Custom Dashboard Sections

You can create custom dashboard layouts using the extracted RBAC components:

```typescript
import { DashboardHeader, StatisticsGrid, QuickActions } from '@/components/rbac';
import { useRBACStatistics } from '@/hooks';

function CustomDashboard({ auditLogger }) {
  const statistics = useRBACStatistics(auditLogger);

  return (
    <div>
      <DashboardHeader />
      <StatisticsGrid
        totalRoles={statistics.totalRoles}
        totalPermissions={statistics.totalPermissions}
        recentAuditLogs={statistics.recentAuditLogs}
      />
      <QuickActions onNavigate={(section) => console.log(section)} />
    </div>
  );
}
```

## Testing Changes

### Testing Individual Components

With the refactoring, you can now test smaller pieces in isolation:

```typescript
import { render, screen } from '@testing-library/react';
import { CandleTooltip } from '@/components/chart';

describe('CandleTooltip', () => {
  it('renders candle data correctly', () => {
    const candle = {
      open: 100,
      high: 110,
      low: 95,
      close: 105,
      volume: 1000,
      time: Date.now(),
    };

    render(<CandleTooltip candle={candle} />);
    
    expect(screen.getByText(/Open: 100.00/)).toBeInTheDocument();
    expect(screen.getByText(/High: 110.00/)).toBeInTheDocument();
  });

  it('renders nothing when candle is null', () => {
    const { container } = render(<CandleTooltip candle={null} />);
    expect(container.firstChild).toBeNull();
  });
});
```

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useChartState } from '@/hooks';

describe('useChartState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useChartState());
    
    expect(result.current.timeframe).toBe('1h');
    expect(result.current.indicators).toEqual([]);
    expect(result.current.isDrawingMode).toBe(false);
  });

  it('updates timeframe', () => {
    const { result } = renderHook(() => useChartState());
    
    act(() => {
      result.current.setTimeframe('1d');
    });
    
    expect(result.current.timeframe).toBe('1d');
  });
});
```

## Performance Considerations

The refactoring improves performance in several ways:

1. **Smaller Bundle Sizes**: Tree-shaking can now remove unused sub-components
2. **Better Memoization**: Smaller components are easier to memoize effectively
3. **Reduced Re-renders**: Isolated state changes don't trigger full component re-renders

### Optimization Tips

```typescript
// Memoize sub-components when passing callbacks
const MemoizedChartToolbar = memo(ChartToolbar);

// Use useCallback for event handlers
const handleTimeframeChange = useCallback((timeframe) => {
  setTimeframe(timeframe);
  onTimeframeChange?.(timeframe);
}, [setTimeframe, onTimeframeChange]);
```

## Troubleshooting

### Import Errors

If you see import errors after pulling these changes:

1. Clear your build cache: `rm -rf node_modules/.vite`
2. Restart your development server
3. Check that all imports use the correct paths

### Type Errors

If TypeScript complains about missing types:

1. Ensure you're importing from the correct location
2. Check that barrel exports (`index.ts`) are being resolved
3. Restart your TypeScript server in your IDE

### Runtime Errors

If you encounter runtime errors:

1. Verify all props are being passed correctly
2. Check that refs are properly initialized
3. Ensure hooks are called in the correct order

## Benefits Summary

- **Maintainability**: Easier to understand and modify individual pieces
- **Testability**: Smaller units are simpler to test
- **Reusability**: Components and hooks can be used in different contexts
- **Performance**: Better optimization opportunities
- **Developer Experience**: Clearer code organization and faster navigation

## Questions or Issues?

If you encounter any problems or have questions about the refactoring, please:

1. Check this migration guide
2. Review the `COMPONENT_REFACTORING_SUMMARY.md` document
3. Open an issue on GitHub with details about your problem

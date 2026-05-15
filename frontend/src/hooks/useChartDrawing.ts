import { useCallback } from 'react';
import { DrawingTool } from '@/types/charting';
import { DrawingToolManager } from '@/services/DrawingToolManager';

interface UseChartDrawingProps {
  drawingTools: DrawingTool[];
  isDrawingMode: boolean;
  drawingManager: DrawingToolManager;
  onDrawingToolsChange: (tools: DrawingTool[]) => void;
  onDrawingModeChange: (mode: boolean) => void;
  onSelectedToolChange: (tool: DrawingTool | null) => void;
}

export function useChartDrawing({
  drawingTools,
  isDrawingMode,
  drawingManager,
  onDrawingToolsChange,
  onDrawingModeChange,
  onSelectedToolChange,
}: UseChartDrawingProps) {
  const startDrawing = useCallback((toolType: DrawingTool['type']) => {
    onDrawingModeChange(true);
    const tool = drawingManager.addTool(toolType);
    onSelectedToolChange(tool);
  }, [drawingManager, onDrawingModeChange, onSelectedToolChange]);

  const stopDrawing = useCallback(() => {
    onDrawingModeChange(false);
    onSelectedToolChange(null);
  }, [onDrawingModeChange, onSelectedToolChange]);

  const clearAllTools = useCallback(() => {
    drawingManager.clearTools();
    onDrawingToolsChange([]);
  }, [drawingManager, onDrawingToolsChange]);

  const finalizeTool = useCallback(() => {
    const tool = drawingManager.finalizeTool();
    if (tool) {
      onDrawingToolsChange([...drawingTools, tool]);
    }
  }, [drawingManager, drawingTools, onDrawingToolsChange]);

  return { startDrawing, stopDrawing, clearAllTools, finalizeTool };
}

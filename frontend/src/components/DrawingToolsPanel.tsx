import React, { useState } from 'react';
import { DrawingTool } from '@/types/charting';

interface DrawingToolsPanelProps {
  tools: DrawingTool[];
  onStartDrawing: (toolType: DrawingTool['type']) => void;
  onRemoveTool: (toolId: string) => void;
  onToggleToolVisibility: (toolId: string) => void;
  onUpdateToolColor: (toolId: string, color: string) => void;
  onClearAll: () => void;
}

const DRAWING_TOOLS: Array<{ type: DrawingTool['type']; label: string }> = [
  { type: 'line', label: 'Line' },
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'circle', label: 'Circle' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'freehand', label: 'Freehand' },
  { type: 'trendline', label: 'Trend Line' },
];

export function DrawingToolsPanel({
  tools,
  onStartDrawing,
  onRemoveTool,
  onToggleToolVisibility,
  onUpdateToolColor,
  onClearAll,
}: DrawingToolsPanelProps) {
  const [selectedToolType, setSelectedToolType] = useState<DrawingTool['type'] | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  return (
    <div className="drawing-tools-panel">
      <div className="panel-header">
        <h3>Drawing Tools</h3>
        {tools.length > 0 && (
          <button className="clear-all-btn" onClick={onClearAll} aria-label="Clear all drawings">
            Clear All
          </button>
        )}
      </div>

      <div className="tools-selector">
        <label>Select Tool:</label>
        <div className="tools-grid">
          {DRAWING_TOOLS.map(tool => (
            <button
              key={tool.type}
              className={`tool-btn ${selectedToolType === tool.type ? 'active' : ''}`}
              onClick={() => {
                setSelectedToolType(tool.type);
                onStartDrawing(tool.type);
              }}
              title={tool.label}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tools-list">
        <h4>Active Drawings ({tools.length})</h4>
        {tools.length === 0 ? (
          <p className="no-tools">No drawings yet</p>
        ) : (
          tools.map(tool => (
            <div key={tool.id} className="tool-item">
              <div
                className="tool-header"
                onClick={() =>
                  setExpandedToolId(expandedToolId === tool.id ? null : tool.id)
                }
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedToolId(expandedToolId === tool.id ? null : tool.id); } }}
                role="button"
                tabIndex={0}
                aria-expanded={expandedToolId === tool.id}
              >
                <div className="tool-info">
                  <input
                    type="checkbox"
                    checked={tool.visible}
                    onChange={() => onToggleToolVisibility(tool.id)}
                    className="tool-toggle"
                  />
                  <span className="tool-type">{tool.type}</span>
                  {tool.label && <span className="tool-label">{tool.label}</span>}
                  <span className="tool-points">({tool.points.length} pts)</span>
                  <div
                    className="tool-color-indicator"
                    style={{ backgroundColor: tool.color }}
                  />
                </div>
                <button
                  className="remove-btn"
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveTool(tool.id);
                  }}
                  aria-label={`Remove ${tool.type} drawing`}
                >
                  ×
                </button>
              </div>

              {expandedToolId === tool.id && (
                <div className="tool-settings">
                  <div className="setting-item">
                    <label>Color:</label>
                    <div className="color-picker">
                      <input
                        type="color"
                        value={tool.color}
                        onChange={e => onUpdateToolColor(tool.id, e.target.value)}
                      />
                      <span className="color-value">{tool.color}</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <label>Width:</label>
                    <span className="width-value">{tool.width}px</span>
                  </div>

                  <div className="setting-item">
                    <label>Type:</label>
                    <span className="type-value">{tool.type}</span>
                  </div>

                  {tool.label && (
                    <div className="setting-item">
                      <label>Label:</label>
                      <span className="label-value">{tool.label}</span>
                    </div>
                  )}

                  <div className="setting-item">
                    <label>Points:</label>
                    <span className="points-value">{tool.points.length}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface DrawingToolbarProps {
  isDrawing: boolean;
  currentTool: DrawingTool['type'] | null;
  onStartDrawing: (toolType: DrawingTool['type']) => void;
  onStopDrawing: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function DrawingToolbar({
  isDrawing,
  currentTool,
  onStartDrawing,
  onStopDrawing,
  onUndo,
  onRedo,
}: DrawingToolbarProps) {
  return (
    <div className="drawing-toolbar">
      <div className="toolbar-section">
        <span className="status">
          {isDrawing ? `Drawing: ${currentTool}` : 'Ready'}
        </span>
      </div>

      {isDrawing && (
        <div className="toolbar-actions">
          <button onClick={onStopDrawing} className="stop-btn">
            Stop Drawing
          </button>
          {onUndo && (
            <button onClick={onUndo} className="undo-btn" title="Undo">
              ↶
            </button>
          )}
          {onRedo && (
            <button onClick={onRedo} className="redo-btn" title="Redo">
              ↷
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface LineDrawingOptionsProps {
  width: number;
  color: string;
  onWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
}

export function LineDrawingOptions({
  width,
  color,
  onWidthChange,
  onColorChange,
}: LineDrawingOptionsProps) {
  return (
    <div className="line-options">
      <div className="option-item">
        <label>Line Width:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={width}
          onChange={e => onWidthChange(Number(e.target.value))}
          className="width-slider"
        />
        <span className="width-value">{width}px</span>
      </div>

      <div className="option-item">
        <label>Color:</label>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="color-input"
        />
      </div>
    </div>
  );
}

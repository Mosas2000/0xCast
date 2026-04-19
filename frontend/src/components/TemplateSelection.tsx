import React from 'react';
import { getAllTemplates } from '../config/templates';
import type { TemplateCategory } from '../types/template';

interface TemplateSelectionProps {
  onSelectTemplate: (templateId: TemplateCategory) => void;
  selectedTemplate: TemplateCategory | null;
}

export function TemplateSelection({ onSelectTemplate, selectedTemplate }: TemplateSelectionProps) {
  const templates = getAllTemplates();

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  };

  const cardStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '24px',
    border: isSelected ? '2px solid #00D9FF' : '1px solid #1F1F1F',
    borderRadius: '12px',
    backgroundColor: isSelected ? '#0A1929' : '#0A0A0A',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  });

  const iconStyle: React.CSSProperties = {
    fontSize: '32px',
    marginBottom: '8px',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    lineHeight: '1.5',
  };

  const examplesStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '8px',
  };

  return (
    <div style={containerStyle}>
      {templates.map(template => {
        const isSelected = selectedTemplate === template.id;
        return (
          <div
            key={template.id}
            style={cardStyle(isSelected)}
            onClick={() => onSelectTemplate(template.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectTemplate(template.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div style={iconStyle}>{template.icon}</div>
            <div style={nameStyle}>{template.name}</div>
            <div style={descriptionStyle}>{template.description}</div>
            {template.examples.length > 0 && (
              <div style={examplesStyle}>
                {template.examples.length} example{template.examples.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

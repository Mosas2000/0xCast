import React from 'react';
import type { TemplateCategory } from '@/types/template';
import { getTemplate, marketTemplates } from '@/config/templates';

interface TemplateHelpProps {
  templateId: TemplateCategory | null;
  step: 'question' | 'duration' | 'category' | 'review';
}

export function TemplateHelp({ templateId, step }: TemplateHelpProps) {
  const template = templateId ? getTemplate(templateId) : null;

  const containerStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#0A1929',
    border: '1px solid #1F1F1F',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const contentStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.6',
  };

  const exampleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    backgroundColor: '#000000',
    padding: '8px 12px',
    borderRadius: '6px',
    marginTop: '8px',
    fontStyle: 'italic',
  };

  const examplesListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  };

  if (!template) {
    return null;
  }

  const getStepHelp = () => {
    switch (step) {
      case 'question':
        return {
          title: 'Crafting Your Question',
          content: template.questionGuide,
          examples: template.examples.slice(0, 2),
        };
      case 'duration':
        return {
          title: 'Choosing Duration',
          content: 'Select how long you want the market to remain active. After the duration ends, the market will close and move to resolution.',
          examples: [],
        };
      case 'category':
        return {
          title: 'Category Selection',
          content: template.categoryGuide,
          examples: [],
        };
      case 'review':
        return {
          title: 'Final Review',
          content: 'Review all your market details before creation. Once created, the market cannot be edited.',
          examples: [],
        };
    }
  };

  const help = getStepHelp();

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        💡 {help.title}
      </div>
      <div style={contentStyle}>{help.content}</div>
      {template.tips.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
            Tips:
          </div>
          {template.tips.slice(0, 2).map((tip, idx) => (
            <div key={idx} style={exampleStyle}>
              ✓ {tip}
            </div>
          ))}
        </div>
      )}
      {help.examples.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>
            Examples:
          </div>
          <div style={examplesListStyle}>
            {help.examples.map((example, idx) => (
              <div key={idx} style={exampleStyle}>
                "{example.question}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

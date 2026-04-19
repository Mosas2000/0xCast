import React from 'react';
import type { MarketTemplate } from '../types/template';
import { CATEGORY_METADATA } from '../types/market';

interface MarketReviewProps {
  question: string;
  duration: number;
  category: string;
  template: MarketTemplate | null;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export function MarketReview({
  question,
  duration,
  category,
  template,
  onConfirm,
  onEdit,
  isLoading = false,
}: MarketReviewProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  };

  const cardStyle: React.CSSProperties = {
    padding: '24px',
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: '1.6',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  };

  const tipsStyle: React.CSSProperties = {
    backgroundColor: '#0A1929',
    border: '1px solid #1F1F1F',
    borderRadius: '8px',
    padding: '16px',
  };

  const tipsTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '12px',
  };

  const tipItemStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#9CA3AF',
    marginBottom: '8px',
    paddingLeft: '16px',
    position: 'relative',
  };

  const tipItemBefore: React.CSSProperties = {
    content: '✓',
    position: 'absolute',
    left: '0',
    color: '#00D9FF',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: '12px 32px',
    backgroundColor: '#00D9FF',
    border: 'none',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    opacity: isLoading ? 0.6 : 1,
    pointerEvents: isLoading ? 'none' : 'auto',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    padding: '12px 32px',
    backgroundColor: 'transparent',
    border: '1px solid #1F1F1F',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    pointerEvents: isLoading ? 'none' : 'auto',
  };

  const categoryMeta = CATEGORY_METADATA[category as any];
  const durationInDays = Math.floor(duration / 144);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={sectionStyle}>
          <div>
            <div style={labelStyle}>Your Question</div>
            <div style={valueStyle}>{question}</div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={gridStyle}>
          <div>
            <div style={labelStyle}>Template</div>
            <div style={valueStyle}>{template?.name || 'Custom'}</div>
          </div>
          <div>
            <div style={labelStyle}>Category</div>
            <div style={valueStyle}>
              {categoryMeta?.label || category}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Duration</div>
            <div style={valueStyle}>{durationInDays} days</div>
          </div>
          <div>
            <div style={labelStyle}>Outcomes</div>
            <div style={valueStyle}>Yes / No</div>
          </div>
        </div>
      </div>

      {template && template.tips.length > 0 && (
        <div style={tipsStyle}>
          <div style={tipsTitleStyle}>Tips for this template:</div>
          {template.tips.slice(0, 3).map((tip, idx) => (
            <div key={idx} style={tipItemStyle}>
              <span style={tipItemBefore}>✓</span>
              {tip}
            </div>
          ))}
        </div>
      )}

      <div style={buttonsStyle}>
        <button
          style={secondaryButtonStyle}
          onClick={onEdit}
          disabled={isLoading}
        >
          Edit Details
        </button>
        <button
          style={primaryButtonStyle}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Market'}
        </button>
      </div>
    </div>
  );
}

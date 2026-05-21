/**
 * MarketForm Component
 * 
 * Form for creating a new prediction market.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  CreateMarketFormData, 
  MarketCategory
} from '@/types/market';
import { 
  MARKET_CATEGORIES, 
  MARKET_DURATIONS, 
  CATEGORY_METADATA 
} from '@/types/market';
import { 
  validateMarketForm, 
  formatBlocksToTime,
  suggestQuestionImprovements 
} from '@/utils/marketValidation';

interface MarketFormProps {
  onSubmit: (data: CreateMarketFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function MarketForm({ onSubmit, isSubmitting, error }: MarketFormProps) {
  const [formData, setFormData] = useState<CreateMarketFormData>({
    question: '',
    category: MARKET_CATEGORIES.OTHER,
    durationBlocks: MARKET_DURATIONS.ONE_WEEK,
    durationPreset: 'ONE_WEEK',
  });
  
  const [touched, setTouched] = useState({
    question: false,
    category: false,
    duration: false,
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [customDurationDays, setCustomDurationDays] = useState('');
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  const validation = useMemo(() => validateMarketForm(formData), [formData]);
  const questionSuggestions = useMemo(
    () => suggestQuestionImprovements(formData.question),
    [formData.question],
  );

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, question: e.target.value }));
  };

  const handleCategoryChange = (category: MarketCategory) => {
    setFormData(prev => ({ ...prev, category }));
    setTouched(prev => ({ ...prev, category: true }));
  };

  const handleDurationPresetChange = (preset: keyof typeof MARKET_DURATIONS) => {
    setFormData(prev => ({
      ...prev,
      durationBlocks: MARKET_DURATIONS[preset],
      durationPreset: preset,
    }));
    setTouched(prev => ({ ...prev, duration: true }));
    setShowCustomDuration(false);
    setCustomDurationDays('');
  };

  const handleCustomDurationChange = (days: string) => {
    setCustomDurationDays(days);
    const daysNum = parseInt(days);
    if (!isNaN(daysNum) && daysNum > 0) {
      setFormData(prev => ({
        ...prev,
        durationBlocks: daysNum * 144, // Convert days to blocks
        durationPreset: undefined,
      }));
      setTouched(prev => ({ ...prev, duration: true }));
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      question: true,
      category: true,
      duration: true,
    });

    if (validation.isValid) {
      onSubmit(formData);
    }
  }, [validation.isValid, onSubmit, formData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && validation.isValid && !isSubmitting) {
        handleSubmit(e as unknown as React.FormEvent);
      }
      // Escape to toggle preview
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [validation.isValid, isSubmitting, showPreview, handleSubmit]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#111111',
    border: '1px solid #2F2F2F',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#E5E7EB',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#F87171',
    fontSize: '13px',
    marginTop: '6px',
  };

  const categoryCardStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: '1',
    minWidth: '140px',
    padding: '16px',
    backgroundColor: isSelected ? '#3B82F620' : '#0A0A0A',
    border: `2px solid ${isSelected ? '#3B82F6' : '#1F1F1F'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  });

  const durationButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: '1',
    padding: '12px 16px',
    backgroundColor: isSelected ? '#3B82F6' : 'transparent',
    border: `1px solid ${isSelected ? '#3B82F6' : '#374151'}`,
    borderRadius: '10px',
    color: isSelected ? '#FFFFFF' : '#9CA3AF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {/* Question Input */}
      <div style={{ marginBottom: '28px' }}>
        <label htmlFor="question" style={labelStyle}>
          Market Question <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <textarea
          id="question"
          value={formData.question}
          onChange={handleQuestionChange}
          onBlur={() => setTouched(prev => ({ ...prev, question: true }))}
          placeholder="Will Bitcoin reach $100,000 by December 2026?"
          rows={3}
          maxLength={256}
          autoFocus
          aria-invalid={touched.question && validation.errors.question ? 'true' : 'false'}
          aria-describedby={
            touched.question && validation.errors.question ? 'question-error' : undefined
          }
          style={{
            ...inputStyle,
            borderColor: touched.question && validation.errors.question ? '#EF4444' : '#2F2F2F',
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginTop: '6px',
        }}>
          <div style={{ flex: 1 }}>
            {touched.question && validation.errors.question && (
              <div id="question-error" style={errorStyle} role="alert">
                {validation.errors.question}
              </div>
            )}
            {!validation.errors.question && formData.question && (
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {questionSuggestions[0]}
              </div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginLeft: '12px' }}>
            {formData.question.length}/256
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>
          Category <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div 
          role="radiogroup"
          aria-labelledby="category-label"
          aria-describedby={
            touched.category && validation.errors.category ? 'category-error' : undefined
          }
          style={{ 
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap',
          marginTop: '8px',
        }}>
          {Object.values(CATEGORY_METADATA).map(cat => (
            <div
              key={cat.id}
              role="radio"
              aria-checked={formData.category === cat.id}
              tabIndex={0}
              onClick={() => handleCategoryChange(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryChange(cat.id);
                }
              }}
              style={categoryCardStyle(formData.category === cat.id)}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
              <div style={{ 
                color: formData.category === cat.id ? '#3B82F6' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {cat.label}
              </div>
            </div>
          ))}
        </div>
        {touched.category && validation.errors.category && (
          <div id="category-error" style={errorStyle} role="alert">
            {validation.errors.category}
          </div>
        )}
      </div>

      {/* Duration Selection */}
      <div style={{ marginBottom: '28px' }}>
        <label id="duration-label" style={labelStyle}>
          Duration <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div 
          role="radiogroup"
          aria-labelledby="duration-label"
          aria-describedby={
            touched.duration && validation.errors.duration ? 'duration-error' : undefined
          }
          style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px',
          marginTop: '8px',
        }}>
          {Object.entries(MARKET_DURATIONS).map(([key, blocks]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleDurationPresetChange(key as keyof typeof MARKET_DURATIONS)}
              style={durationButtonStyle(formData.durationPreset === key)}
            >
              <div>{key.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                {formatBlocksToTime(blocks)}
              </div>
            </button>
          ))}
        </div>
        
        {/* Custom Duration Option */}
        <div style={{ marginTop: '10px' }}>
          {!showCustomDuration ? (
            <button
              type="button"
              onClick={() => setShowCustomDuration(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px dashed #374151',
                borderRadius: '8px',
                color: '#9CA3AF',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              + Custom Duration
            </button>
          ) : (
            <div style={{
              padding: '12px',
              backgroundColor: '#0A0A0A',
              border: '1px solid #2F2F2F',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  id="custom-duration-input"
                  type="number"
                  value={customDurationDays}
                  onChange={(e) => handleCustomDurationChange(e.target.value)}
                  placeholder="Enter days"
                  min="1"
                  aria-invalid={touched.duration && validation.errors.duration ? 'true' : 'false'}
                  aria-describedby={
                    touched.duration && validation.errors.duration ? 'duration-error' : undefined
                  }
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#111111',
                    border: '1px solid #2F2F2F',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomDuration(false);
                    setCustomDurationDays('');
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#9CA3AF',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ 
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#9CA3AF',
        }}>
          Selected: <span style={{ color: '#FFFFFF', fontWeight: '500' }}>
            {formData.durationBlocks.toLocaleString()} blocks
          </span> ({formatBlocksToTime(formData.durationBlocks)})
        </div>
        {touched.duration && validation.errors.duration && (
          <div id="duration-error" style={errorStyle} role="alert">
            {validation.errors.duration}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div style={{ marginBottom: '28px' }}>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            border: '1px solid #374151',
            borderRadius: '10px',
            color: '#9CA3AF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {showPreview ? '▼' : '▶'} Preview Market
        </button>
        
        {showPreview && formData.question && (
          <div style={{
            marginTop: '16px',
            padding: '20px',
            backgroundColor: '#0A0A0A',
            border: '2px solid #1F1F1F',
            borderRadius: '16px',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>
                {CATEGORY_METADATA[formData.category].icon}
              </span>
              <span style={{ 
                fontSize: '12px',
                fontWeight: '600',
                color: '#3B82F6',
                textTransform: 'uppercase',
              }}>
                {CATEGORY_METADATA[formData.category].label}
              </span>
            </div>
            <div style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '12px',
              lineHeight: '1.4',
            }}>
              {formData.question}
            </div>
            <div style={{ 
              fontSize: '13px',
              color: '#6B7280',
            }}>
              Duration: {formatBlocksToTime(formData.durationBlocks)}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div 
          id="market-form-error"
          role="alert"
          style={{
          padding: '14px 16px',
          backgroundColor: '#EF444420',
          border: '1px solid #EF444440',
          borderRadius: '10px',
          marginBottom: '20px',
          color: '#F87171',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !validation.isValid}
        style={{
          width: '100%',
          padding: '16px 24px',
          backgroundColor: validation.isValid && !isSubmitting ? '#3B82F6' : '#374151',
          border: 'none',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: '600',
          cursor: validation.isValid && !isSubmitting ? 'pointer' : 'not-allowed',
          opacity: validation.isValid && !isSubmitting ? 1 : 0.5,
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        {isSubmitting ? 'Creating Market...' : 'Create Market'}
        {validation.isValid && !isSubmitting && (
          <span style={{ 
            fontSize: '11px', 
            opacity: 0.7,
            marginLeft: '8px',
          }}>
            (⌘+Enter)
          </span>
        )}
      </button>

      {/* Info Note */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: '#3B82F620',
        border: '1px solid #3B82F640',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#93C5FD',
        lineHeight: '1.5',
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px' }}>
          ℹ️ Market Creation Tips
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Markets require a small transaction fee</li>
          <li>Choose clear, verifiable outcomes</li>
          <li>Your market becomes active immediately</li>
          <li>You can share the market link after creation</li>
        </ul>
      </div>
    </form>
  );
}

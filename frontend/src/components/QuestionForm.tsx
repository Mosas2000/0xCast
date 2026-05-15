import React, { useState } from 'react';
import type { ValidationState } from '../types/template';
import {
  getQuestionSuggestions,
  formatDurationLabel,
  formatEndDate,
} from '../utils/templateValidation';

interface QuestionFormProps {
  question: string;
  duration: number;
  category: string;
  validation: ValidationState;
  onQuestionChange: (question: string) => void;
  onDurationChange: (duration: number) => void;
  onCategoryChange: (category: string) => void;
}

const COMMON_DURATIONS = [
  { label: '1 Day', blocks: 144 },
  { label: '3 Days', blocks: 432 },
  { label: '1 Week', blocks: 1008 },
  { label: '2 Weeks', blocks: 2016 },
  { label: '1 Month', blocks: 4320 },
  { label: '3 Months', blocks: 12960 },
];

const CATEGORIES = [
  { value: 'crypto', label: 'Crypto' },
  { value: 'sports', label: 'Sports' },
  { value: 'politics', label: 'Politics' },
  { value: 'economics', label: 'Economics' },
  { value: 'technology', label: 'Technology' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

export function QuestionForm({
  question,
  duration,
  category,
  validation,
  onQuestionChange,
  onDurationChange,
  onCategoryChange,
}: QuestionFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = getQuestionSuggestions(question);

  const questionErrorId = 'question-error';
  const questionSuggestionId = 'question-suggestion';
  const durationErrorId = 'duration-error';
  const categoryErrorId = 'category-error';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#9CA3AF',
  };

  const textareaStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#0A0A0A',
    border: validation.question.error ? '1px solid #EF4444' : '1px solid #1F1F1F',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'border-color 0.2s ease',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#EF4444',
    marginTop: '4px',
  };

  const suggestionStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#F59E0B',
    marginTop: '4px',
    padding: '8px 12px',
    backgroundColor: '#78350F',
    borderRadius: '6px',
  };

  const charCountStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    textAlign: 'right',
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 12px',
    backgroundColor: '#0A0A0A',
    border: validation.category.error ? '1px solid #EF4444' : '1px solid #1F1F1F',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const durationGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '8px',
  };

  const durationButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    backgroundColor: isSelected ? '#00D9FF' : '#0A0A0A',
    border: isSelected ? '1px solid #00D9FF' : '1px solid #1F1F1F',
    borderRadius: '8px',
    color: isSelected ? '#000000' : '#FFFFFF',
    fontSize: '13px',
    fontWeight: isSelected ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const previewStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#0A1929',
    border: '1px solid #1F1F1F',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#9CA3AF',
  };

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <label htmlFor="question-input" style={labelStyle}>
          Your Prediction Question
        </label>
        <div style={descriptionStyle}>
          Write a clear, specific question that can be objectively resolved. Include a timeframe and make the outcome verifiable.
        </div>
        <textarea
          id="question-input"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="e.g., Will Bitcoin reach $50,000 by end of Q2 2024?"
          style={textareaStyle}
          maxLength={500}
          aria-invalid={validation.question.error ? 'true' : 'false'}
          aria-describedby={
            validation.question.error
              ? questionErrorId
              : validation.question.suggestion
              ? questionSuggestionId
              : undefined
          }
        />
        <div style={charCountStyle}>
          {question.length}/500
        </div>
        {validation.question.error && (
          <div id={questionErrorId} style={errorStyle} role="alert">
            ⚠ {validation.question.error}
          </div>
        )}
        {validation.question.suggestion && !validation.question.error && (
          <div id={questionSuggestionId} style={suggestionStyle}>
            💡 {validation.question.suggestion}
          </div>
        )}
        {suggestions.length > 0 && showSuggestions && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suggestions.map((suggestion, idx) => (
              <div key={idx} style={suggestionStyle}>
                💡 {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div 
          id="duration-label" 
          style={labelStyle} 
          role="group" 
          aria-labelledby="duration-label"
          aria-describedby={validation.duration.error ? durationErrorId : undefined}
        >
          Market Duration
        </div>
        <div style={descriptionStyle}>
          How long should the market remain active? The market will close after this period and then resolve.
        </div>
        <div style={durationGridStyle}>
          {COMMON_DURATIONS.map(preset => (
            <button
              key={preset.blocks}
              style={durationButtonStyle(duration === preset.blocks)}
              onClick={() => onDurationChange(preset.blocks)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div style={previewStyle}>
          Closes: {formatEndDate(duration)}
        </div>
        {validation.duration.error && (
          <div id={durationErrorId} style={errorStyle} role="alert">
            ⚠ {validation.duration.error}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <label htmlFor="category-select" style={labelStyle}>
          Market Category
        </label>
        <div style={descriptionStyle}>
          Select a category to help users discover your market.
        </div>
        <select
          id="category-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={selectStyle}
          aria-invalid={validation.category.error ? 'true' : 'false'}
          aria-describedby={validation.category.error ? categoryErrorId : undefined}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {validation.category.error && (
          <div id={categoryErrorId} style={errorStyle} role="alert">
            ⚠ {validation.category.error}
          </div>
        )}
      </div>
    </div>
  );
}

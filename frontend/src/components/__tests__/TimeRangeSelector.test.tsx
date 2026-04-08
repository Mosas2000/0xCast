import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeRangeSelector, TimeRangeDropdown } from '../TimeRangeSelector';
import type { TimeRange } from '../../types/analytics';

describe('TimeRangeSelector', () => {
  const mockOnChange = vi.fn();
  const timeRanges: TimeRange[] = ['24h', '7d', '30d', '90d', 'all'];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all time range options', () => {
    render(
      <TimeRangeSelector 
        value="7d" 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('24H')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
  });

  it('highlights selected time range', () => {
    render(
      <TimeRangeSelector 
        value="30d" 
        onChange={mockOnChange} 
      />
    );
    
    const button = screen.getByText('30D');
    expect(button.closest('button')).toHaveClass('bg-blue-500');
  });

  it('calls onChange when option clicked', () => {
    render(
      <TimeRangeSelector 
        value="7d" 
        onChange={mockOnChange} 
      />
    );
    
    screen.getByText('24H').click();
    expect(mockOnChange).toHaveBeenCalledWith('24h');
  });
});

describe('TimeRangeDropdown', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with selected value', () => {
    render(
      <TimeRangeDropdown 
        value="7d" 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('contains all time range options', () => {
    render(
      <TimeRangeDropdown 
        value="7d" 
        onChange={mockOnChange} 
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeRangeSelector, TimeRangeDropdown } from '../TimeRangeSelector';

describe('TimeRangeSelector', () => {
  const mockOnChange = vi.fn();

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
    expect(button).toHaveClass('bg-blue-600');
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

  it('renders unselected options with neutral styling', () => {
    render(
      <TimeRangeSelector 
        value="7d" 
        onChange={mockOnChange} 
      />
    );
    
    const unselectedButton = screen.getByText('24H');
    expect(unselectedButton).toHaveClass('text-neutral-400');
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
    expect(select).toHaveValue('7d');
  });

  it('has correct option values', () => {
    render(
      <TimeRangeDropdown 
        value="30d" 
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByRole('option', { name: '24H' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '7D' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '30D' })).toBeInTheDocument();
  });
});

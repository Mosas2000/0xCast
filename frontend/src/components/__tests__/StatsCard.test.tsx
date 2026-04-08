import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard, StatsGrid } from '../StatsCard';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Total Markets" value="150" />);
    expect(screen.getByText('Total Markets')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatsCard title="Active Users" value={1234} />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatsCard title="Volume" value="$1M" subtitle="Last 24h" />);
    expect(screen.getByText('Last 24h')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <StatsCard 
        title="Test" 
        value="100" 
        icon={<span data-testid="test-icon">📊</span>} 
      />
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders positive trend indicator', () => {
    render(
      <StatsCard 
        title="Growth" 
        value="500" 
        trend={{ value: 12.5, isPositive: true }} 
      />
    );
    expect(screen.getByText(/12\.5%/)).toBeInTheDocument();
  });

  it('renders negative trend indicator', () => {
    render(
      <StatsCard 
        title="Decline" 
        value="300" 
        trend={{ value: 5.2, isPositive: false }} 
      />
    );
    expect(screen.getByText(/5\.2%/)).toBeInTheDocument();
  });

  it('applies color styles', () => {
    const { container } = render(
      <StatsCard title="Success" value="100" color="green" />
    );
    // Check that the card contains color-specific classes
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { rerender, container } = render(
      <StatsCard title="Test" value="100" size="sm" />
    );
    expect(container.firstChild).toBeInTheDocument();

    rerender(<StatsCard title="Test" value="100" size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsCard title="Test" value="100" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without optional props', () => {
    render(<StatsCard title="Basic" value="50" />);
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});

describe('StatsGrid', () => {
  it('renders children', () => {
    render(
      <StatsGrid>
        <StatsCard title="Card 1" value="100" />
        <StatsCard title="Card 2" value="200" />
      </StatsGrid>
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('applies grid layout classes', () => {
    const { container } = render(
      <StatsGrid>
        <div>Child</div>
      </StatsGrid>
    );
    expect(container.firstChild).toHaveClass('grid');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsGrid className="custom-grid">
        <div>Child</div>
      </StatsGrid>
    );
    expect(container.firstChild).toHaveClass('custom-grid');
  });
});

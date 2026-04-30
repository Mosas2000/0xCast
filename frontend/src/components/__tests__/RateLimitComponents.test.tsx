import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateLimitStatus } from '../RateLimitStatus';
import { RateLimitBanner } from '../RateLimitBanner';
import { RateLimitDashboard } from '../RateLimitDashboard';
import { RateLimitStatus as RateLimitStatusType } from '@/types/rateLimit';

vi.mock('@/hooks/useRateLimit', () => ({
  useAllRateLimits: vi.fn(() => ({
    statuses: [
      {
        action: 'stake',
        remaining: 10,
        resetAt: Date.now() + 60000,
        blocked: false,
      },
      {
        action: 'trade',
        remaining: 5,
        resetAt: Date.now() + 30000,
        blocked: false,
      },
    ],
    loading: false,
    refreshStatuses: vi.fn(),
  })),
}));

describe('RateLimitStatus', () => {
  it('should render available status', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 10,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    render(<RateLimitStatus status={status} />);

    expect(screen.getByText('10 remaining')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render blocked status', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 0,
      resetAt: Date.now() + 60000,
      blocked: true,
      cooldownUntil: Date.now() + 5000,
    };

    render(<RateLimitStatus status={status} />);

    expect(screen.getByText('Rate Limited')).toBeInTheDocument();
    expect(screen.getByText('🚫')).toBeInTheDocument();
  });

  it('should render warning status', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 2,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    render(<RateLimitStatus status={status} />);

    expect(screen.getByText('2 remaining')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should hide details when showDetails is false', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 10,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    const { container } = render(<RateLimitStatus status={status} showDetails={false} />);

    const detailsElement = container.querySelector('.text-xs');
    expect(detailsElement).not.toBeInTheDocument();
  });
});

describe('RateLimitBanner', () => {
  it('should not render when not blocked and remaining > 2', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 10,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    const { container } = render(<RateLimitBanner status={status} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render warning banner when remaining <= 2', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 2,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    render(<RateLimitBanner status={status} />);

    expect(screen.getByText('Rate Limit Warning')).toBeInTheDocument();
    expect(screen.getByText(/2 stake requests remaining/)).toBeInTheDocument();
  });

  it('should render blocked banner when blocked', () => {
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 0,
      resetAt: Date.now() + 60000,
      blocked: true,
      cooldownUntil: Date.now() + 5000,
    };

    render(<RateLimitBanner status={status} />);

    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/exceeded the rate limit/)).toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn();
    const status: RateLimitStatusType = {
      action: 'stake',
      remaining: 2,
      resetAt: Date.now() + 60000,
      blocked: false,
    };

    render(<RateLimitBanner status={status} onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss');
    dismissButton.click();

    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('RateLimitDashboard', () => {
  it('should render loading state', () => {
    vi.mocked(require('@/hooks/useRateLimit').useAllRateLimits).mockReturnValue({
      statuses: [],
      loading: true,
      refreshStatuses: vi.fn(),
    });

    render(<RateLimitDashboard userId="test-user" />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should render all rate limit statuses', () => {
    render(<RateLimitDashboard userId="test-user" />);

    expect(screen.getByText('Rate Limit Status')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
    expect(screen.getByText('Trading')).toBeInTheDocument();
  });

  it('should have refresh button', () => {
    render(<RateLimitDashboard userId="test-user" />);

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });
});

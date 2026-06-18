import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareModal } from '../ShareModal';

describe('ShareModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('renders share details and copies the market link', () => {
    render(
      React.createElement(ShareModal, {
        isOpen: true,
        onClose: vi.fn(),
        marketId: 42,
        marketQuestion: 'Will STX reach $5?',
        yesPercentage: 61,
        noPercentage: 39,
        poolSize: 12500000,
      })
    );

    expect(screen.getByText('Share Market')).toBeInTheDocument();
    const shareUrl = `${window.location.origin}/trade/42`;
    expect(screen.getByDisplayValue(shareUrl)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl);
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialButtons } from '../SocialButtons';

describe('SocialButtons', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('opens the share modal from the primary action', () => {
    render(React.createElement(SocialButtons, { marketId: 7, variant: 'button' }));

    fireEvent.click(screen.getByRole('button', { name: /share market/i }));
    expect(screen.getByRole('heading', { name: 'Share Market' })).toBeInTheDocument();
  });
});

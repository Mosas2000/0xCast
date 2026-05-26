import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialButtons } from '../SocialButtons';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

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

    fireEvent.click(screen.getByRole('button', { name: /share this market/i }));
    expect(screen.getByRole('heading', { name: 'Share Market' })).toBeInTheDocument();
  });
});

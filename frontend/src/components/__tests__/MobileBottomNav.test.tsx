import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileBottomNav } from '../MobileBottomNav';

describe('MobileBottomNav', () => {
  it('includes the watchlist route', () => {
    render(
      <MemoryRouter initialEntries={['/watchlist']}>
        <MobileBottomNav />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Watchlist' })).toHaveAttribute('href', '/watchlist');
  });
});

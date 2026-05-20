import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeaderboardPage } from '../LeaderboardPage';

vi.mock('../../hooks/useLeaderboard', () => ({
  useLeaderboard: () => ({
    byWinRate: [
      {
        rank: 1,
        address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
        displayName: 'TradeKing',
        winRate: 78.5,
        totalVolume: BigInt(125000),
        wins: 157,
        losses: 43,
        lastUpdated: new Date('2026-04-15T00:00:00Z'),
      },
    ],
    byVolume: [],
    weeklyRanking: [],
    monthlyRanking: [],
    isLoading: false,
    error: null,
    lastRefresh: new Date('2026-04-15T00:00:00Z'),
  }),
}));

describe('LeaderboardPage', () => {
  it('renders leaderboard entries', () => {
    render(React.createElement(LeaderboardPage));

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('TradeKing')).toBeInTheDocument();
    expect(screen.getByText('78.5%')).toBeInTheDocument();
  });
});

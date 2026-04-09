import { useState, useEffect } from 'react';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  winRate: number;
  totalVolume: bigint;
  wins: number;
  losses: number;
  lastUpdated: Date;
}

export interface LeaderboardStats {
  byWinRate: LeaderboardEntry[];
  byVolume: LeaderboardEntry[];
  weeklyRanking: LeaderboardEntry[];
  monthlyRanking: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    displayName: 'TradeKing',
    winRate: 78.5,
    totalVolume: BigInt(125000),
    wins: 157,
    losses: 43,
    lastUpdated: new Date(),
  },
  {
    rank: 2,
    address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    displayName: 'PredictionMaster',
    winRate: 75.2,
    totalVolume: BigInt(98500),
    wins: 139,
    losses: 46,
    lastUpdated: new Date(),
  },
  {
    rank: 3,
    address: 'SPKYM37F9D3CMFFC3DT3X5R0JRMP7F7Z6V7Z6V7Z',
    displayName: 'MarketWizard',
    winRate: 72.8,
    totalVolume: BigInt(87200),
    wins: 131,
    losses: 49,
    lastUpdated: new Date(),
  },
  {
    rank: 4,
    address: 'ST3F4SQQ2ZV7N8X9Y0A1B2C3D4E5F6G7H8I9J0K1',
    displayName: 'CryptoTrader',
    winRate: 69.5,
    totalVolume: BigInt(76800),
    wins: 121,
    losses: 53,
    lastUpdated: new Date(),
  },
  {
    rank: 5,
    address: 'SPQWERTY1234ASDFGHJKLZXCVBNM1234567890AB',
    displayName: 'BlockchainPro',
    winRate: 67.3,
    totalVolume: BigInt(65400),
    wins: 103,
    losses: 50,
    lastUpdated: new Date(),
  },
];

export function useLeaderboard(
  refreshInterval: number = 60000
): LeaderboardStats {
  const [byWinRate, setByWinRate] = useState<LeaderboardEntry[]>([]);
  const [byVolume, setByVolume] = useState<LeaderboardEntry[]>([]);
  const [weeklyRanking, setWeeklyRanking] = useState<LeaderboardEntry[]>([]);
  const [monthlyRanking, setMonthlyRanking] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call - in production, this would fetch from backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Sort by win rate
        const sortedByWinRate = [...MOCK_LEADERBOARD_DATA].sort(
          (a, b) => b.winRate - a.winRate
        );
        setByWinRate(sortedByWinRate);

        // Sort by volume
        const sortedByVolume = [...MOCK_LEADERBOARD_DATA].sort(
          (a, b) => Number(b.totalVolume - a.totalVolume)
        );
        setByVolume(sortedByVolume);

        // Weekly ranking (currently same as overall)
        setWeeklyRanking([...sortedByWinRate].slice(0, 10));

        // Monthly ranking (currently same as overall)
        setMonthlyRanking([...sortedByWinRate].slice(0, 10));

        setLastRefresh(new Date());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load leaderboard'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up refresh interval
    const interval = setInterval(fetchLeaderboard, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    byWinRate,
    byVolume,
    weeklyRanking,
    monthlyRanking,
    isLoading,
    error,
    lastRefresh,
  };
}

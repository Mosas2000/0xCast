import type { MultiMarket, MultiOutcomeOption } from '../types/market';

const BASIS_POINTS_DIVISOR = 10000;
const MICROSTX_PER_STX = 1_000_000;

function parseOutcomeName(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const value = (raw as { value: unknown }).value;
    if (typeof value === 'string') {
      return value;
    }
  }
  return '';
}

function parseOutcomeStake(raw: unknown): number {
  if (typeof raw === 'number') {
    return raw;
  }
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const value = (raw as { value: unknown }).value;
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

export function parseMultiMarketData(marketId: number, rawData: any): MultiMarket {
  const namesRaw = rawData['outcome-names'] ?? [];
  const stakesRaw = rawData['outcome-stakes'] ?? [];
  const outcomeCount = Number(rawData['outcome-count'] ?? 0);

  const stakes: number[] = Array.isArray(stakesRaw)
    ? stakesRaw.map((value) => parseOutcomeStake(value))
    : [];
  const names: string[] = Array.isArray(namesRaw)
    ? namesRaw.map((value) => parseOutcomeName(value))
    : [];

  const totalPool = stakes.reduce((sum, stake) => sum + stake, 0);

  const outcomes: MultiOutcomeOption[] = Array.from({ length: outcomeCount }, (_, index) => {
    const stake = stakes[index] ?? 0;
    const percentage = totalPool > 0 ? Math.round((stake / totalPool) * 1000) / 10 : 0;
    return {
      index,
      name: names[index] || `Outcome ${index + 1}`,
      stake,
      percentage,
    };
  });

  return {
    id: marketId,
    question: rawData.question,
    creator: rawData.creator,
    outcomes,
    outcomeCount,
    endDate: Number(rawData['end-date']),
    resolutionDate: Number(rawData['resolution-date']),
    status: Number(rawData.status),
    winningOutcome:
      rawData['winning-outcome'] && typeof rawData['winning-outcome'] === 'object' && 'value' in rawData['winning-outcome']
        ? Number(rawData['winning-outcome'].value)
        : null,
    createdAt: Number(rawData['created-at']),
  };
}

export function basisPointsToPercent(basisPoints: number): number {
  return Math.round((basisPoints / BASIS_POINTS_DIVISOR) * 1000) / 10;
}

export function microStxToStxValue(microStx: number): number {
  return microStx / MICROSTX_PER_STX;
}

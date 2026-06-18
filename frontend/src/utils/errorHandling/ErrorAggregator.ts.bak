export interface AggregatedError {
  type: string;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  samples: Error[];
}

export class ErrorAggregator {
  private errors: Map<string, AggregatedError> = new Map();
  private maxSamples: number;

  constructor(maxSamples: number = 5) {
    this.maxSamples = maxSamples;
  }

  add(error: Error): void {
    const key = this.getErrorKey(error);
    const existing = this.errors.get(key);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = Date.now();
      if (existing.samples.length < this.maxSamples) {
        existing.samples.push(error);
      }
    } else {
      this.errors.set(key, {
        type: error.name,
        count: 1,
        firstOccurrence: Date.now(),
        lastOccurrence: Date.now(),
        samples: [error],
      });
    }
  }

  getAll(): AggregatedError[] {
    return Array.from(this.errors.values());
  }

  getByType(type: string): AggregatedError | null {
    for (const [key, value] of this.errors.entries()) {
      if (value.type === type) {
        return value;
      }
    }
    return null;
  }

  getMostFrequent(limit: number = 10): AggregatedError[] {
    return this.getAll()
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getRecent(limit: number = 10): AggregatedError[] {
    return this.getAll()
      .sort((a, b) => b.lastOccurrence - a.lastOccurrence)
      .slice(0, limit);
  }

  clear(): void {
    this.errors.clear();
  }

  clearType(type: string): void {
    for (const [key, value] of this.errors.entries()) {
      if (value.type === type) {
        this.errors.delete(key);
      }
    }
  }

  getStats(): {
    totalTypes: number;
    totalErrors: number;
    mostFrequentType: string | null;
  } {
    const all = this.getAll();
    const totalErrors = all.reduce((sum, e) => sum + e.count, 0);
    const mostFrequent = all.sort((a, b) => b.count - a.count)[0];

    return {
      totalTypes: all.length,
      totalErrors,
      mostFrequentType: mostFrequent?.type || null,
    };
  }

  private getErrorKey(error: Error): string {
    return `${error.name}:${error.message}`;
  }
}

export const errorAggregator = new ErrorAggregator();

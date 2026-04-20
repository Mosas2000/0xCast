import { Candlestick } from '@/types/charting';

export interface ChartPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  startIndex: number;
  endIndex: number;
  description: string;
  targetPrice?: number;
  stopLoss?: number;
}

export class PatternRecognitionService {
  private readonly minCandlesRequired = 5;
  private readonly maxCandlesRequired = 20;

  detectPatterns(candles: Candlestick[]): ChartPattern[] {
    if (candles.length < this.minCandlesRequired) return [];

    const patterns: ChartPattern[] = [];

    patterns.push(...this.detectHeadAndShoulders(candles));
    patterns.push(...this.detectTrianglePattern(candles));
    patterns.push(...this.detectWedgePattern(candles));
    patterns.push(...this.detectDoubleTop(candles));
    patterns.push(...this.detectDoubleBottom(candles));
    patterns.push(...this.detectFlagPattern(candles));
    patterns.push(...this.detectPennnantPattern(candles));

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private detectHeadAndShoulders(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 15;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const peaks = this.findLocalPeaks(segment);

      if (peaks.length === 3) {
        const leftShoulder = peaks[0];
        const head = peaks[1];
        const rightShoulder = peaks[2];

        const shoulderHeightRatio = (head.high - head.close) / (leftShoulder.high - leftShoulder.close);

        if (
          head.high > leftShoulder.high &&
          head.high > rightShoulder.high &&
          shoulderHeightRatio > 1.2 &&
          shoulderHeightRatio < 2.5 &&
          Math.abs(leftShoulder.high - rightShoulder.high) < leftShoulder.high * 0.05
        ) {
          const neckline = Math.min(leftShoulder.low, rightShoulder.low);
          const pattern: ChartPattern = {
            id: `hs-${i}`,
            name: 'Head and Shoulders',
            type: 'bearish',
            confidence: this.calculateHeadAndShouldersConfidence(
              leftShoulder,
              head,
              rightShoulder,
              neckline
            ),
            startIndex: i,
            endIndex: i + window,
            description: 'Reversal pattern indicating potential downtrend',
            targetPrice: neckline - (head.high - neckline),
            stopLoss: head.high,
          };
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  private detectTrianglePattern(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 10;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const highs = segment.map(c => c.high);
      const lows = segment.map(c => c.low);

      const minHigh = Math.min(...highs);
      const maxHigh = Math.max(...highs);
      const minLow = Math.min(...lows);
      const maxLow = Math.max(...lows);

      const highRange = maxHigh - minHigh;
      const lowRange = maxLow - minLow;
      const totalRange = Math.max(highRange, lowRange);

      if (totalRange > 0) {
        const convergenceRatio = (highRange + lowRange) / totalRange;

        if (convergenceRatio < 0.3) {
          const midpoint = (maxHigh + minLow) / 2;
          const pattern: ChartPattern = {
            id: `tri-${i}`,
            name: 'Triangle',
            type: 'neutral',
            confidence: 0.65,
            startIndex: i,
            endIndex: i + window,
            description: 'Continuation pattern with converging highs and lows',
            targetPrice: this.extrapolateTriangleTarget(segment, minHigh, maxLow),
          };
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  private detectWedgePattern(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 12;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const highs = segment.map((c, idx) => ({ idx, high: c.high }));
      const lows = segment.map((c, idx) => ({ idx, low: c.low }));

      const highLine = this.fitTrendline(highs.map(h => h.high));
      const lowLine = this.fitTrendline(lows.map(l => l.low));

      const isWedge =
        (highLine.slope > 0 && lowLine.slope > 0) ||
        (highLine.slope < 0 && lowLine.slope < 0);

      if (isWedge) {
        const convergence = Math.abs(highLine.slope - lowLine.slope);
        if (convergence > 0.01 && convergence < 0.1) {
          const wedgeType = highLine.slope > 0 ? 'rising' : 'falling';
          const pattern: ChartPattern = {
            id: `wedge-${i}`,
            name: `${wedgeType.charAt(0).toUpperCase() + wedgeType.slice(1)} Wedge`,
            type: wedgeType === 'rising' ? 'bullish' : 'bearish',
            confidence: 0.58,
            startIndex: i,
            endIndex: i + window,
            description: `${wedgeType} wedge pattern indicating consolidation`,
          };
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  private detectDoubleTop(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 12;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const peaks = this.findLocalPeaks(segment);

      if (peaks.length >= 2) {
        const firstPeak = peaks[0];
        const secondPeak = peaks[peaks.length - 1];

        const heightDifference = Math.abs(firstPeak.high - secondPeak.high);
        const averageHeight = (firstPeak.high + secondPeak.high) / 2;

        if (heightDifference < averageHeight * 0.03) {
          const neckline = Math.min(firstPeak.low, secondPeak.low);
          const pattern: ChartPattern = {
            id: `dtop-${i}`,
            name: 'Double Top',
            type: 'bearish',
            confidence: 0.72,
            startIndex: i,
            endIndex: i + window,
            description: 'Reversal pattern at resistance level',
            targetPrice: neckline - (firstPeak.high - neckline),
            stopLoss: Math.max(firstPeak.high, secondPeak.high),
          };
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  private detectDoubleBottom(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 12;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const troughs = this.findLocalTroughs(segment);

      if (troughs.length >= 2) {
        const firstTrough = troughs[0];
        const secondTrough = troughs[troughs.length - 1];

        const depthDifference = Math.abs(firstTrough.low - secondTrough.low);
        const averageDepth = (firstTrough.low + secondTrough.low) / 2;

        if (depthDifference < averageDepth * 0.03) {
          const neckline = Math.max(firstTrough.high, secondTrough.high);
          const pattern: ChartPattern = {
            id: `dbot-${i}`,
            name: 'Double Bottom',
            type: 'bullish',
            confidence: 0.72,
            startIndex: i,
            endIndex: i + window,
            description: 'Reversal pattern at support level',
            targetPrice: neckline + (neckline - firstTrough.low),
            stopLoss: Math.min(firstTrough.low, secondTrough.low),
          };
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  private detectFlagPattern(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 8;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const closes = segment.map(c => c.close);
      const range = Math.max(...closes) - Math.min(...closes);

      const flagPole = segment[0];
      const flagMagnitude = Math.abs(flagPole.close - segment[segment.length - 1].close);

      if (range < flagMagnitude * 0.2 && flagMagnitude > 0) {
        const pattern: ChartPattern = {
          id: `flag-${i}`,
          name: 'Flag',
          type: flagMagnitude > 0 ? 'bullish' : 'bearish',
          confidence: 0.61,
          startIndex: i,
          endIndex: i + window,
          description: 'Continuation pattern with consolidation',
        };
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private detectPennnantPattern(candles: Candlestick[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const window = 10;

    for (let i = 0; i < candles.length - window; i++) {
      const segment = candles.slice(i, i + window);
      const highs = segment.map(c => c.high);
      const lows = segment.map(c => c.low);

      const highRange = Math.max(...highs) - Math.min(...highs);
      const lowRange = Math.max(...lows) - Math.min(...lows);

      if (highRange < highRange * 0.15 && lowRange < lowRange * 0.15) {
        const pattern: ChartPattern = {
          id: `pennant-${i}`,
          name: 'Pennant',
          type: 'neutral',
          confidence: 0.55,
          startIndex: i,
          endIndex: i + window,
          description: 'Consolidation pattern similar to small triangle',
        };
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private findLocalPeaks(candles: Candlestick[]): Candlestick[] {
    const peaks: Candlestick[] = [];
    for (let i = 1; i < candles.length - 1; i++) {
      if (candles[i].high > candles[i - 1].high && candles[i].high > candles[i + 1].high) {
        peaks.push(candles[i]);
      }
    }
    return peaks;
  }

  private findLocalTroughs(candles: Candlestick[]): Candlestick[] {
    const troughs: Candlestick[] = [];
    for (let i = 1; i < candles.length - 1; i++) {
      if (candles[i].low < candles[i - 1].low && candles[i].low < candles[i + 1].low) {
        troughs.push(candles[i]);
      }
    }
    return troughs;
  }

  private fitTrendline(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private extrapolateTriangleTarget(
    segment: Candlestick[],
    minHigh: number,
    maxLow: number
  ): number {
    const midpoint = (minHigh + maxLow) / 2;
    const range = minHigh - maxLow;
    return midpoint + range;
  }

  private calculateHeadAndShouldersConfidence(
    leftShoulder: Candlestick,
    head: Candlestick,
    rightShoulder: Candlestick,
    neckline: number
  ): number {
    let confidence = 0.7;

    const shoulderSymmetry =
      1 - Math.abs(leftShoulder.high - rightShoulder.high) / Math.max(leftShoulder.high, rightShoulder.high);
    confidence += shoulderSymmetry * 0.2;

    const headProminence = (head.high - neckline) / ((leftShoulder.high + rightShoulder.high) / 2 - neckline);
    if (headProminence > 1.3) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }
}

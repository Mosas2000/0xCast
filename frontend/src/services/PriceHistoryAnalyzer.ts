import { OraclePrice } from '@/types/oracle';

export class PriceHistoryAnalyzer {
  static calculateMovingAverage(prices: OraclePrice[], period: number): number {
    if (prices.length < period) {
      return prices.reduce((sum, p) => sum + p.value, 0) / prices.length;
    }

    const recent = prices.slice(-period);
    return recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
  }

  static calculateExponentialMovingAverage(prices: OraclePrice[], period: number): number {
    if (prices.length === 0) return 0;

    const multiplier = 2 / (period + 1);
    let ema = prices[0].value;

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i].value * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  static calculateStandardDeviation(prices: OraclePrice[]): number {
    if (prices.length === 0) return 0;

    const mean = prices.reduce((sum, p) => sum + p.value, 0) / prices.length;
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / prices.length;

    return Math.sqrt(variance);
  }

  static calculateBollingerBands(
    prices: OraclePrice[],
    period: number = 20,
    standardDeviations: number = 2
  ): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const middle = this.calculateMovingAverage(prices, period);
    const stdDev = this.calculateStandardDeviation(prices.slice(-period));

    return {
      upper: middle + stdDev * standardDeviations,
      middle,
      lower: middle - stdDev * standardDeviations,
    };
  }

  static calculateRSI(prices: OraclePrice[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i].value - prices[i - 1].value);
    }

    const gains = changes.filter((c) => c > 0).reduce((sum, c) => sum + c, 0) / period;
    const losses = Math.abs(
      changes
        .filter((c) => c < 0)
        .reduce((sum, c) => sum + c, 0) / period
    );

    const rs = losses === 0 ? 100 : gains / losses;
    return 100 - 100 / (1 + rs);
  }

  static calculateMACD(
    prices: OraclePrice[]
  ): {
    macd: number;
    signal: number;
    histogram: number;
  } {
    const ema12 = this.calculateExponentialMovingAverage(prices, 12);
    const ema26 = this.calculateExponentialMovingAverage(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateExponentialMovingAverage(prices, 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  static calculateVolatility(prices: OraclePrice[], period: number = 20): number {
    if (prices.length < period) {
      return this.calculateStandardDeviation(prices);
    }

    const recent = prices.slice(-period);
    return this.calculateStandardDeviation(recent);
  }

  static calculatePriceChange(prices: OraclePrice[]): {
    absolute: number;
    percentage: number;
    period: number;
  } {
    if (prices.length < 2) {
      return { absolute: 0, percentage: 0, period: 0 };
    }

    const first = prices[0].value;
    const last = prices[prices.length - 1].value;
    const absolute = last - first;
    const percentage = first === 0 ? 0 : (absolute / first) * 100;

    return {
      absolute,
      percentage,
      period: prices[prices.length - 1].timestamp - prices[0].timestamp,
    };
  }

  static calculateTrendStrength(prices: OraclePrice[]): {
    strength: number;
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
  } {
    if (prices.length < 3) {
      return { strength: 0, direction: 'neutral', confidence: 0 };
    }

    const values = prices.map((p) => p.value);
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    const recentChange = values[values.length - 1] - values[values.length - 2];
    const direction = recentChange > 0 ? 'up' : recentChange < 0 ? 'down' : 'neutral';

    const strength = range === 0 ? 0 : Math.abs(recentChange) / range;
    const confidence = Math.min(prices.length / 10, 1);

    return { strength, direction, confidence };
  }

  static identifySupport(prices: OraclePrice[], period: number = 20): number {
    if (prices.length === 0) return 0;

    const recent = prices.slice(-period);
    const values = recent.map((p) => p.value);
    return Math.min(...values);
  }

  static identifyResistance(prices: OraclePrice[], period: number = 20): number {
    if (prices.length === 0) return 0;

    const recent = prices.slice(-period);
    const values = recent.map((p) => p.value);
    return Math.max(...values);
  }

  static calculatePriceDeviation(prices: OraclePrice[], target: number): {
    deviation: number;
    percentage: number;
    direction: 'above' | 'below';
  } {
    if (prices.length === 0) {
      return { deviation: 0, percentage: 0, direction: 'above' };
    }

    const current = prices[prices.length - 1].value;
    const deviation = current - target;
    const percentage = target === 0 ? 0 : (deviation / target) * 100;
    const direction = deviation >= 0 ? 'above' : 'below';

    return { deviation, percentage, direction };
  }

  static predictNextPrice(prices: OraclePrice[]): {
    predicted: number;
    confidence: number;
    method: string;
  } {
    if (prices.length < 2) {
      const current = prices.length > 0 ? prices[0].value : 0;
      return { predicted: current, confidence: 0, method: 'insufficient_data' };
    }

    const values = prices.map((p) => p.value);
    const n = values.length;

    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    const numerator = values.reduce(
      (sum, y, i) => sum + (i - xMean) * (y - yMean),
      0
    );
    const denominator = Array.from({ length: n }, (_, i) => Math.pow(i - xMean, 2)).reduce(
      (a, b) => a + b,
      0
    );

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;
    const predicted = slope * (n - 1) + intercept;

    const r2 = this.calculateR2(values, slope, intercept, xMean, yMean);

    return {
      predicted: Math.max(0, predicted),
      confidence: Math.max(0, Math.min(1, Math.abs(r2))),
      method: 'linear_regression',
    };
  }

  private static calculateR2(
    values: number[],
    slope: number,
    intercept: number,
    xMean: number,
    yMean: number
  ): number {
    const n = values.length;
    const ssRes = values.reduce(
      (sum, y, i) => sum + Math.pow(y - (slope * i + intercept), 2),
      0
    );
    const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);

    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  }

  static generateAnalysis(prices: OraclePrice[]): {
    current: number;
    average: number;
    high: number;
    low: number;
    volatility: number;
    trend: string;
    rsi: number;
    macd: number;
  } {
    if (prices.length === 0) {
      return {
        current: 0,
        average: 0,
        high: 0,
        low: 0,
        volatility: 0,
        trend: 'neutral',
        rsi: 50,
        macd: 0,
      };
    }

    const values = prices.map((p) => p.value);
    const { direction } = this.calculateTrendStrength(prices);
    const { macd } = this.calculateMACD(prices);

    return {
      current: values[values.length - 1],
      average: values.reduce((a, b) => a + b, 0) / values.length,
      high: Math.max(...values),
      low: Math.min(...values),
      volatility: this.calculateVolatility(prices),
      trend: direction,
      rsi: this.calculateRSI(prices),
      macd,
    };
  }
}

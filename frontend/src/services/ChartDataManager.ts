import { OHLCV, Candlestick, Timeframe, ChartScale } from '@/types/charting';

export class ChartDataManager {
  private priceCache: Map<string, OHLCV[]> = new Map();
  private candleCache: Map<string, Candlestick[]> = new Map();

  convertToCandlesticks(ohlcv: OHLCV[]): Candlestick[] {
    return ohlcv.map(candle => ({
      ...candle,
      color: candle.close >= candle.open ? 'green' : 'red',
    }));
  }

  aggregateCandlesticks(candles: Candlestick[], fromTimeframe: Timeframe, toTimeframe: Timeframe): Candlestick[] {
    const fromMs = this.timeframeToMs(fromTimeframe);
    const toMs = this.timeframeToMs(toTimeframe);

    if (fromMs >= toMs) return candles;

    const multiplier = toMs / fromMs;
    const aggregated: Candlestick[] = [];

    for (let i = 0; i < candles.length; i += multiplier) {
      const group = candles.slice(i, i + multiplier);
      if (group.length === 0) continue;

      const aggregated_candle: Candlestick = {
        time: group[0].time,
        open: group[0].open,
        high: Math.max(...group.map(c => c.high)),
        low: Math.min(...group.map(c => c.low)),
        close: group[group.length - 1].close,
        volume: group.reduce((sum, c) => sum + c.volume, 0),
        color: group[group.length - 1].close >= group[0].open ? 'green' : 'red',
      };

      aggregated.push(aggregated_candle);
    }

    return aggregated;
  }

  calculateScale(candles: Candlestick[], padding: number = 0.1): ChartScale {
    if (candles.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 1,
        minTime: 0,
        maxTime: 1,
        pricePerPixel: 1,
        timePerPixel: 1,
      };
    }

    const prices = candles.flatMap(c => [c.high, c.low]);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    const range = maxPrice - minPrice;
    const padAmount = range * padding;

    minPrice -= padAmount;
    maxPrice += padAmount;

    const minTime = candles[0].time;
    const maxTime = candles[candles.length - 1].time;

    return {
      minPrice,
      maxPrice,
      minTime,
      maxTime,
      pricePerPixel: 1,
      timePerPixel: 1,
    };
  }

  private timeframeToMs(timeframe: Timeframe): number {
    const map: Record<Timeframe, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
    };
    return map[timeframe] || 60 * 1000;
  }

  cacheData(key: string, data: OHLCV[]): void {
    this.priceCache.set(key, data);
  }

  getCachedData(key: string): OHLCV[] | undefined {
    return this.priceCache.get(key);
  }

  cacheCandlesticks(key: string, candles: Candlestick[]): void {
    this.candleCache.set(key, candles);
  }

  getCachedCandlesticks(key: string): Candlestick[] | undefined {
    return this.candleCache.get(key);
  }

  clearCache(): void {
    this.priceCache.clear();
    this.candleCache.clear();
  }

  calculateHighLow(candles: Candlestick[]): { high: number; low: number } {
    if (candles.length === 0) return { high: 0, low: 0 };

    return {
      high: Math.max(...candles.map(c => c.high)),
      low: Math.min(...candles.map(c => c.low)),
    };
  }

  calculatePriceChange(candles: Candlestick[]): { change: number; percent: number } {
    if (candles.length < 2) return { change: 0, percent: 0 };

    const first = candles[0].open;
    const last = candles[candles.length - 1].close;
    const change = last - first;
    const percent = (change / first) * 100;

    return { change, percent };
  }

  findCandleAtPrice(candles: Candlestick[], price: number): Candlestick | null {
    for (const candle of candles) {
      if (price >= candle.low && price <= candle.high) {
        return candle;
      }
    }
    return null;
  }

  sliceByTimeRange(candles: Candlestick[], startTime: number, endTime: number): Candlestick[] {
    return candles.filter(c => c.time >= startTime && c.time <= endTime);
  }

  getCandle(candles: Candlestick[], index: number): Candlestick | null {
    return candles[index] || null;
  }

  getLastCandle(candles: Candlestick[]): Candlestick | null {
    return candles[candles.length - 1] || null;
  }

  appendCandle(candles: Candlestick[], newCandle: Candlestick): Candlestick[] {
    const lastCandle = candles[candles.length - 1];

    if (lastCandle && lastCandle.time === newCandle.time) {
      const updated = [...candles];
      updated[updated.length - 1] = newCandle;
      return updated;
    }

    return [...candles, newCandle];
  }

  calculateVolumeSMA(candles: Candlestick[], period: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        result.push(0);
        continue;
      }

      const sum = candles.slice(i - period + 1, i + 1).reduce((acc, c) => acc + c.volume, 0);
      result.push(sum / period);
    }

    return result;
  }
}

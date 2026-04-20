import { AMMPool } from '@/types/amm';

export interface PriceAlert {
  id: string;
  poolId: string;
  condition: 'above' | 'below' | 'change';
  targetPrice?: number;
  changePercent?: number;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface PriceRecord {
  timestamp: number;
  price: number;
  poolId: string;
}

export class PriceMonitor {
  private priceHistory: Map<string, PriceRecord[]>;
  private alerts: Map<string, PriceAlert>;
  private lastPrices: Map<string, number>;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 1000) {
    this.priceHistory = new Map();
    this.alerts = new Map();
    this.lastPrices = new Map();
    this.maxHistorySize = maxHistorySize;
  }

  recordPrice(poolId: string, pool: AMMPool): void {
    const price = Number(pool.reserveB) / Number(pool.reserveA);

    if (!this.priceHistory.has(poolId)) {
      this.priceHistory.set(poolId, []);
    }

    const history = this.priceHistory.get(poolId);
    if (history) {
      history.push({
        timestamp: Date.now(),
        price,
        poolId,
      });

      if (history.length > this.maxHistorySize) {
        history.shift();
      }
    }

    this.lastPrices.set(poolId, price);
    this.checkAlerts(poolId, price);
  }

  getLastPrice(poolId: string): number | undefined {
    return this.lastPrices.get(poolId);
  }

  getPriceHistory(poolId: string, limitSize?: number): PriceRecord[] {
    const history = this.priceHistory.get(poolId) || [];
    if (!limitSize) return history;
    return history.slice(-limitSize);
  }

  getPriceChange(poolId: string, windowMs: number): number | null {
    const history = this.getPriceHistory(poolId);
    if (history.length < 2) return null;

    const cutoffTime = Date.now() - windowMs;
    const relevantHistory = history.filter(h => h.timestamp >= cutoffTime);

    if (relevantHistory.length < 2) return null;

    const oldPrice = relevantHistory[0].price;
    const newPrice = relevantHistory[relevantHistory.length - 1].price;

    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  addAlert(alert: PriceAlert): void {
    this.alerts.set(alert.id, alert);
  }

  removeAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  private checkAlerts(poolId: string, currentPrice: number): void {
    for (const [alertId, alert] of this.alerts.entries()) {
      if (!alert.active || alert.poolId !== poolId) continue;

      let triggered = false;

      if (alert.condition === 'above' && alert.targetPrice !== undefined) {
        triggered = currentPrice >= alert.targetPrice;
      } else if (alert.condition === 'below' && alert.targetPrice !== undefined) {
        triggered = currentPrice <= alert.targetPrice;
      } else if (alert.condition === 'change' && alert.changePercent !== undefined) {
        const lastPrice = this.lastPrices.get(poolId);
        if (lastPrice) {
          const change = ((currentPrice - lastPrice) / lastPrice) * 100;
          triggered = Math.abs(change) >= alert.changePercent;
        }
      }

      if (triggered && !alert.triggeredAt) {
        alert.triggeredAt = Date.now();
        alert.active = false;
      }
    }
  }

  getTriggeredAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.triggeredAt !== undefined);
  }

  getActiveAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.active);
  }

  calculateHighLow(poolId: string): { high: number; low: number; current: number } {
    const history = this.getPriceHistory(poolId);
    if (history.length === 0) {
      return { high: 0, low: 0, current: 0 };
    }

    const prices = history.map(h => h.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const current = prices[prices.length - 1];

    return { high, low, current };
  }

  calculateMovingAverage(poolId: string, windowSize: number): number | null {
    const history = this.getPriceHistory(poolId, windowSize);
    if (history.length === 0) return null;

    const sum = history.reduce((acc, h) => acc + h.price, 0);
    return sum / history.length;
  }

  calculateVolatility(poolId: string, windowSize: number): number {
    const history = this.getPriceHistory(poolId, windowSize);
    if (history.length < 2) return 0;

    const prices = history.map(h => h.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;

    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;

    return Math.sqrt(variance);
  }

  clearHistory(poolId?: string): void {
    if (poolId) {
      this.priceHistory.delete(poolId);
    } else {
      this.priceHistory.clear();
    }
  }

  getStats(poolId: string): {
    currentPrice: number | undefined;
    high: number;
    low: number;
    volume: number;
    volatility: number;
    movingAverage: number | null;
  } {
    const highLow = this.calculateHighLow(poolId);
    const history = this.getPriceHistory(poolId);

    return {
      currentPrice: this.getLastPrice(poolId),
      high: highLow.high,
      low: highLow.low,
      volume: history.length,
      volatility: this.calculateVolatility(poolId, 100),
      movingAverage: this.calculateMovingAverage(poolId, 20),
    };
  }
}

export class PriceNotificationService {
  private monitor: PriceMonitor;
  private subscribers: Map<string, (alert: PriceAlert) => void>;

  constructor(monitor: PriceMonitor) {
    this.monitor = monitor;
    this.subscribers = new Map();
  }

  subscribe(alertId: string, callback: (alert: PriceAlert) => void): void {
    this.subscribers.set(alertId, callback);
  }

  unsubscribe(alertId: string): void {
    this.subscribers.delete(alertId);
  }

  notifyTriggeredAlerts(): void {
    const triggered = this.monitor.getTriggeredAlerts();

    for (const alert of triggered) {
      const callback = this.subscribers.get(alert.id);
      if (callback) {
        callback(alert);
      }
    }
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  clearSubscriptions(): void {
    this.subscribers.clear();
  }
}

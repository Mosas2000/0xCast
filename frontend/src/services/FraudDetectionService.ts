import { FraudAlert, SuspiciousActivity, SuspiciousActivityType } from '@/types/reputation';

export class FraudDetectionService {
  private alerts: Map<string, FraudAlert> = new Map();
  private suspiciousActivities: Map<string, SuspiciousActivity> = new Map();

  detectWashTrading(userId: string, transactions: any[]): boolean {
    if (transactions.length < 2) return false;

    for (let i = 0; i < transactions.length - 1; i++) {
      const t1 = transactions[i];
      const t2 = transactions[i + 1];

      const timeDelta = Math.abs(t2.timestamp - t1.timestamp);
      const priceDelta = Math.abs(t2.price - t1.price) / t1.price;
      const volumeMatch = Math.min(t1.volume, t2.volume) / Math.max(t1.volume, t2.volume);

      if (timeDelta < 60000 && priceDelta < 0.02 && volumeMatch > 0.9) {
        this.createAlert(userId, 'high_risk_transaction', 'critical', 'Potential wash trading detected');
        this.recordSuspiciousActivity(userId, 'wash_trading', 'critical', 'Multiple transactions with same price and volume in short timeframe');
        return true;
      }
    }

    return false;
  }

  detectSybilAttack(userId: string, accounts: { id: string; ipAddress: string; createdAt: number; tradingPatterns: any }[]): boolean {
    if (accounts.length < 2) return false;

    let similarAccounts = 0;

    for (let i = 0; i < accounts.length - 1; i++) {
      for (let j = i + 1; j < accounts.length; j++) {
        const a1 = accounts[i];
        const a2 = accounts[j];

        if (a1.ipAddress === a2.ipAddress) {
          similarAccounts++;
        }

        const timeDelta = Math.abs(a2.createdAt - a1.createdAt);
        if (timeDelta < 86400000) {
          similarAccounts++;
        }
      }
    }

    const suspicionScore = similarAccounts / accounts.length;

    if (suspicionScore > 0.5) {
      this.createAlert(userId, 'multiple_accounts', 'critical', 'Sybil attack pattern detected');
      this.recordSuspiciousActivity(userId, 'sybil_attack', 'critical', 'Multiple accounts with similar characteristics detected');
      return true;
    }

    return false;
  }

  detectPumpDump(userId: string, transactions: any[]): boolean {
    if (transactions.length < 5) return false;

    const volume = transactions.reduce((sum, t) => sum + t.volume, 0);
    const avgVolume = volume / transactions.length;

    const spikes = transactions.filter(t => t.volume > avgVolume * 3).length;

    if (spikes > transactions.length * 0.3) {
      const prices = transactions.map(t => t.price);
      const priceIncrease = (Math.max(...prices) - Math.min(...prices)) / Math.min(...prices);

      if (priceIncrease > 0.5) {
        this.createAlert(userId, 'high_risk_transaction', 'high', 'Pump and dump pattern detected');
        this.recordSuspiciousActivity(userId, 'pump_dump', 'high', 'Unusual volume spikes followed by price volatility');
        return true;
      }
    }

    return false;
  }

  detectPriceManipulation(userId: string, transactions: any[], marketPrice: number): boolean {
    const avgTransactionPrice = transactions.reduce((sum, t) => sum + t.price, 0) / transactions.length;
    const priceDelta = Math.abs(avgTransactionPrice - marketPrice) / marketPrice;

    if (priceDelta > 0.1) {
      this.createAlert(userId, 'high_risk_transaction', 'high', 'Price manipulation detected');
      this.recordSuspiciousActivity(userId, 'price_manipulation', 'high', `Transactions priced ${(priceDelta * 100).toFixed(2)}% away from market price`);
      return true;
    }

    return false;
  }

  detectVolumeSpoofing(userId: string, orderBook: any[]): boolean {
    const largeOrders = orderBook.filter(order => order.volume > 10000);

    if (largeOrders.length > orderBook.length * 0.5) {
      const cancelledOrders = largeOrders.filter(order => order.cancelled).length;

      if (cancelledOrders / largeOrders.length > 0.7) {
        this.createAlert(userId, 'high_risk_transaction', 'high', 'Volume spoofing detected');
        this.recordSuspiciousActivity(userId, 'volume_spoofing', 'high', 'High volume orders cancelled without execution');
        return true;
      }
    }

    return false;
  }

  detectUnusualPattern(userId: string, userProfile: any): boolean {
    const accountAge = Date.now() - userProfile.createdAt;
    const transactionCount = userProfile.totalTransactions;

    if (accountAge < 86400000 && transactionCount > 100) {
      this.createAlert(userId, 'high_risk_transaction', 'medium', 'Unusual activity pattern detected');
      this.recordSuspiciousActivity(userId, 'unusual_pattern', 'medium', 'New account with high transaction volume');
      return true;
    }

    return false;
  }

  private createAlert(userId: string, type: 'high_risk_transaction' | 'suspicious_pattern' | 'account_compromise' | 'multiple_accounts', severity: 'low' | 'medium' | 'high' | 'critical', message: string): FraudAlert {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alert: FraudAlert = {
      alertId,
      userId,
      type,
      severity,
      message,
      createdAt: Date.now(),
      status: 'active',
      actionRequired: severity === 'critical' || severity === 'high',
    };

    this.alerts.set(alertId, alert);
    return alert;
  }

  private recordSuspiciousActivity(userId: string, type: SuspiciousActivityType, severity: 'low' | 'medium' | 'high' | 'critical', description: string): SuspiciousActivity {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const activity: SuspiciousActivity = {
      activityId,
      userId,
      type,
      severity,
      description,
      detectedAt: Date.now(),
      status: 'pending',
    };

    this.suspiciousActivities.set(activityId, activity);
    return activity;
  }

  getAlerts(userId: string): FraudAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.userId === userId);
  }

  getSuspiciousActivities(userId: string): SuspiciousActivity[] {
    return Array.from(this.suspiciousActivities.values()).filter(activity => activity.userId === userId);
  }

  acknowledgeAlert(alertId: string): FraudAlert {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    this.alerts.set(alertId, alert);
    return alert;
  }

  resolveAlert(alertId: string): FraudAlert {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    this.alerts.set(alertId, alert);
    return alert;
  }

  investigateSuspiciousActivity(activityId: string): SuspiciousActivity {
    const activity = this.suspiciousActivities.get(activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }

    activity.status = 'investigating';
    this.suspiciousActivities.set(activityId, activity);
    return activity;
  }

  confirmSuspiciousActivity(activityId: string): SuspiciousActivity {
    const activity = this.suspiciousActivities.get(activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }

    activity.status = 'confirmed';
    this.suspiciousActivities.set(activityId, activity);
    return activity;
  }

  dismissSuspiciousActivity(activityId: string): SuspiciousActivity {
    const activity = this.suspiciousActivities.get(activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }

    activity.status = 'dismissed';
    this.suspiciousActivities.set(activityId, activity);
    return activity;
  }

  getHighRiskUsers(threshold: number = 50): string[] {
    const riskMap = new Map<string, number>();

    Array.from(this.suspiciousActivities.values()).forEach(activity => {
      if (activity.status === 'confirmed') {
        const current = riskMap.get(activity.userId) || 0;
        const severityScore = activity.severity === 'critical' ? 40 : activity.severity === 'high' ? 30 : activity.severity === 'medium' ? 20 : 10;
        riskMap.set(activity.userId, current + severityScore);
      }
    });

    return Array.from(riskMap.entries())
      .filter(([, score]) => score >= threshold)
      .map(([userId]) => userId);
  }
}

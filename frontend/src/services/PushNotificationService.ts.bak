import type { PushNotificationPayload } from '@/types/notifications';

export class PushNotificationService {
  private static serviceWorkerReady = false;

  static async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.serviceWorkerReady = !!registration;
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    return Notification.requestPermission();
  }

  static async hasPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    return Notification.permission === 'granted';
  }

  static async sendNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const permission = await this.hasPermission();

      if (!permission) {
        return false;
      }

      if (this.serviceWorkerReady && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        if (registration.active) {
          await registration.active.postMessage({
            type: 'PUSH_NOTIFICATION',
            payload,
          });

          return true;
        }
      }

      if ('Notification' in window) {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          tag: payload.tag,
          data: payload.data,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  static async sendBulkNotifications(
    payloads: PushNotificationPayload[]
  ): Promise<number> {
    let successCount = 0;

    for (const payload of payloads) {
      const success = await this.sendNotification(payload);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  }

  static async sendPriceMovementNotification(
    marketName: string,
    change: number,
    changePercent: number,
    marketId: number
  ): Promise<boolean> {
    const direction = change > 0 ? 'up' : 'down';
    const changeText = `${change > 0 ? '+' : ''}${changePercent}%`;

    return this.sendNotification({
      title: `Price Alert: ${marketName}`,
      body: `Price moved ${direction} by ${changeText}`,
      tag: `price_${marketId}`,
      data: {
        marketId: marketId.toString(),
        change: change.toString(),
        type: 'price_movement',
      },
    });
  }

  static async sendMarketExpiryNotification(
    marketName: string,
    daysUntilExpiry: number,
    marketId: number
  ): Promise<boolean> {
    return this.sendNotification({
      title: `Market Expiring: ${marketName}`,
      body: `${daysUntilExpiry} days until expiration`,
      tag: `expiry_${marketId}`,
      data: {
        marketId: marketId.toString(),
        daysUntilExpiry: daysUntilExpiry.toString(),
        type: 'market_expiry',
      },
    });
  }

  static async sendResolutionNotification(
    marketName: string,
    outcome: string,
    marketId: number
  ): Promise<boolean> {
    return this.sendNotification({
      title: `Market Resolved: ${marketName}`,
      body: `Outcome: ${outcome}`,
      tag: `resolution_${marketId}`,
      data: {
        marketId: marketId.toString(),
        outcome,
        type: 'resolution',
      },
    });
  }

  static async sendLiquidityRewardNotification(
    marketName: string,
    rewardAmount: number,
    marketId: number
  ): Promise<boolean> {
    return this.sendNotification({
      title: `Reward Available: ${marketName}`,
      body: `Claim your ${rewardAmount} reward`,
      tag: `reward_${marketId}`,
      data: {
        marketId: marketId.toString(),
        amount: rewardAmount.toString(),
        type: 'liquidity_reward',
      },
    });
  }

  static async sendSystemAlert(
    title: string,
    message: string,
    alertId: string
  ): Promise<boolean> {
    return this.sendNotification({
      title,
      body: message,
      tag: `alert_${alertId}`,
      data: {
        alertId,
        type: 'system_alert',
      },
    });
  }

  static async subscribeToPushNotifications(): Promise<boolean> {
    if (!this.serviceWorkerReady) {
      return false;
    }

    try {
      const permission = await this.requestPermission();

      if (permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        ),
      });

      await this.sendSubscriptionToServer(subscription);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  static async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.serviceWorkerReady) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return false;
      }

      await subscription.unsubscribe();
      await this.sendUnsubscribeToServer(subscription);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  static async getPushSubscriptionStatus(): Promise<boolean> {
    if (!this.serviceWorkerReady) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to get push subscription status:', error);
      return false;
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private static async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  }

  private static async sendUnsubscribeToServer(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send unsubscribe to server');
    }
  }
}

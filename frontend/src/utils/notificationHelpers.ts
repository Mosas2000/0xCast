import { NotificationType, NotificationChannel } from '@/types/notifications';
import { ArrayHelpers } from './arrayHelpers';

export class NotificationHelpers {
  static getNotificationTitle(type: NotificationType, data?: Record<string, any>): string {
    switch (type) {
      case 'price_movement':
        return `${data?.assetName || 'Asset'} Price Alert`;
      case 'market_expiry':
        return 'Market Expiring Soon';
      case 'resolution':
        return 'Market Resolved';
      case 'liquidity_reward':
        return 'Liquidity Reward Available';
      case 'portfolio_update':
        return 'Portfolio Update';
      case 'system_alert':
        return 'System Alert';
      case 'promotion':
        return 'Special Offer';
      default:
        return 'Notification';
    }
  }

  static getNotificationDescription(type: NotificationType): string {
    switch (type) {
      case 'price_movement':
        return 'Alerts when asset prices move significantly';
      case 'market_expiry':
        return 'Reminders about upcoming market expirations';
      case 'resolution':
        return 'Notifications when markets are resolved';
      case 'liquidity_reward':
        return 'Alerts for available liquidity rewards';
      case 'portfolio_update':
        return 'Summary updates about portfolio performance';
      case 'system_alert':
        return 'Important system and maintenance alerts';
      case 'promotion':
        return 'Special offers and promotional events';
      default:
        return '';
    }
  }

  static formatPrice(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(amount);
  }

  static formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    return date.toLocaleDateString('en-US', options);
  }

  static getTimeUntil(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) {
      return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  static getPriorityLabel(type: NotificationType): 'high' | 'medium' | 'low' {
    switch (type) {
      case 'system_alert':
      case 'resolution':
        return 'high';
      case 'price_movement':
      case 'market_expiry':
        return 'medium';
      case 'promotion':
      case 'portfolio_update':
      case 'liquidity_reward':
      default:
        return 'low';
    }
  }

  static getIconForType(type: NotificationType): string {
    switch (type) {
      case 'price_movement':
        return '📊';
      case 'market_expiry':
        return '⏰';
      case 'resolution':
        return '✓';
      case 'liquidity_reward':
        return '💰';
      case 'portfolio_update':
        return '📈';
      case 'system_alert':
        return '⚠️';
      case 'promotion':
        return '🎉';
      default:
        return '🔔';
    }
  }

  static getColorForChannel(channel: NotificationChannel): string {
    switch (channel) {
      case 'in_app':
        return 'bg-blue-50 border-blue-200';
      case 'email':
        return 'bg-green-50 border-green-200';
      case 'push':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }

  static buildNotificationUrl(type: NotificationType, marketId?: string): string {
    const baseUrl = '/dashboard';

    switch (type) {
      case 'price_movement':
      case 'market_expiry':
      case 'resolution':
        return marketId ? `${baseUrl}/markets/${marketId}` : `${baseUrl}/markets`;
      case 'liquidity_reward':
        return `${baseUrl}/rewards`;
      case 'portfolio_update':
        return `${baseUrl}/portfolio`;
      default:
        return baseUrl;
    }
  }

  static getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'immediate':
        return 'As they happen';
      case 'hourly':
        return 'Hourly summary';
      case 'daily':
        return 'Daily summary';
      case 'weekly':
        return 'Weekly summary';
      default:
        return frequency;
    }
  }

  static shouldShowNotification(
    type: NotificationType,
    channel: NotificationChannel,
    enabledTypes?: Set<string>,
    enabledChannels?: Set<string>
  ): boolean {
    const typeKey = `${type}_${channel}`;
    const isTypeEnabled = !enabledTypes || enabledTypes.has(typeKey);
    const isChannelEnabled = !enabledChannels || enabledChannels.has(channel);

    return isTypeEnabled && isChannelEnabled;
  }

  static deduplicateNotifications(notifications: any[]): any[] {
    return ArrayHelpers.deduplicate(
      notifications,
      (notification) => `${notification.type}_${notification.message}_${notification.createdAt}`
    );
  }

  static sortNotifications(notifications: any[], sortBy: 'date' | 'priority' = 'date'): any[] {
    if (sortBy === 'date') {
      return ArrayHelpers.sortByDate(
        notifications,
        (notification) => notification.createdAt,
        'desc'
      );
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return ArrayHelpers.sortBy(notifications, (a, b) => {
      const priorityA = priorityOrder[this.getPriorityLabel(a.type)] || 2;
      const priorityB = priorityOrder[this.getPriorityLabel(b.type)] || 2;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

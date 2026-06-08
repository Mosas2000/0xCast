export type NotificationType =
  | 'price_movement'
  | 'market_expiry'
  | 'resolution'
  | 'liquidity_reward'
  | 'portfolio_update'
  | 'position_change'
  | 'system_alert';

export type NotificationChannel = 'in_app' | 'email' | 'push';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never';

export interface NotificationContent {
  title: string;
  message: string;
  details?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: NotificationContent;
  channels: NotificationChannel[];
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  frequency: NotificationFrequency;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  replyTo?: string;
}

export interface NotificationQuery {
  userId: string;
  status?: NotificationStatus;
  type?: NotificationType;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationPreferenceUpdate {
  type?: NotificationType;
  channel?: NotificationChannel;
  frequency?: NotificationFrequency;
  enabled?: boolean;
}

export interface NotificationEvent {
  type: NotificationType;
  userId: string;
  content: NotificationContent;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface NotificationQueueItem {
  id: string;
  event: NotificationEvent;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  attempts: number;
  maxAttempts: number;
  nextRetry?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceMovementNotificationConfig {
  marketId: number;
  threshold: number;
  direction: 'up' | 'down' | 'both';
  percentage: boolean;
}

export interface MarketExpiryNotificationConfig {
  daysBeforeExpiry: number;
  enabled: boolean;
}

export interface ResolutionNotificationConfig {
  enabled: boolean;
  notifyOnCloseTime: boolean;
}

export interface LiquidityRewardConfig {
  enabled: boolean;
  reminderDaysBefore: number;
}

export interface NotificationStats {
  userId: string;
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  archivedCount: number;
  lastNotificationAt?: string;
  preferenceCount: number;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

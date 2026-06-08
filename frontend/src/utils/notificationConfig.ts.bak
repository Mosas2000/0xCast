import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS, NOTIFICATION_FREQUENCIES } from './notificationConstants';

export interface NotificationConfig {
  enabledTypes: Set<string>;
  enabledChannels: Set<string>;
  maxNotifications: number;
  retentionDays: number;
  batchSize: number;
  debugMode: boolean;
}

export class NotificationConfiguration {
  private static instance: NotificationConfiguration;
  private config: NotificationConfig;

  private constructor() {
    this.config = {
      enabledTypes: new Set(Object.values(NOTIFICATION_TYPES)),
      enabledChannels: new Set(Object.values(NOTIFICATION_CHANNELS)),
      maxNotifications: 1000,
      retentionDays: 30,
      batchSize: 50,
      debugMode: false,
    };
  }

  static getInstance(): NotificationConfiguration {
    if (!NotificationConfiguration.instance) {
      NotificationConfiguration.instance = new NotificationConfiguration();
    }
    return NotificationConfiguration.instance;
  }

  getConfig(): NotificationConfig {
    return this.config;
  }

  setEnabledTypes(types: string[]): void {
    this.config.enabledTypes = new Set(types);
  }

  setEnabledChannels(channels: string[]): void {
    this.config.enabledChannels = new Set(channels);
  }

  setMaxNotifications(max: number): void {
    this.config.maxNotifications = Math.max(100, max);
  }

  setRetentionDays(days: number): void {
    this.config.retentionDays = Math.max(1, days);
  }

  setBatchSize(size: number): void {
    this.config.batchSize = Math.max(10, size);
  }

  setDebugMode(enabled: boolean): void {
    this.config.debugMode = enabled;
  }

  isTypeEnabled(type: string): boolean {
    return this.config.enabledTypes.has(type);
  }

  isChannelEnabled(channel: string): boolean {
    return this.config.enabledChannels.has(channel);
  }

  isNotificationEnabled(type: string, channel: string): boolean {
    return this.isTypeEnabled(type) && this.isChannelEnabled(channel);
  }

  log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[NotificationConfig] ${message}`, data || '');
    }
  }

  reset(): void {
    this.config = {
      enabledTypes: new Set(Object.values(NOTIFICATION_TYPES)),
      enabledChannels: new Set(Object.values(NOTIFICATION_CHANNELS)),
      maxNotifications: 1000,
      retentionDays: 30,
      batchSize: 50,
      debugMode: false,
    };
  }
}

export function configureNotifications(options: Partial<NotificationConfig>): void {
  const config = NotificationConfiguration.getInstance();

  if (options.enabledTypes) {
    config.setEnabledTypes(Array.from(options.enabledTypes));
  }

  if (options.enabledChannels) {
    config.setEnabledChannels(Array.from(options.enabledChannels));
  }

  if (options.maxNotifications) {
    config.setMaxNotifications(options.maxNotifications);
  }

  if (options.retentionDays) {
    config.setRetentionDays(options.retentionDays);
  }

  if (options.batchSize) {
    config.setBatchSize(options.batchSize);
  }

  if (typeof options.debugMode === 'boolean') {
    config.setDebugMode(options.debugMode);
  }
}

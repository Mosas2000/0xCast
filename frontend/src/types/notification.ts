/**
 * Notification type enum
 */
export enum NotificationType {
    STAKE = 'stake',
    RESOLUTION = 'resolution',
    WIN = 'win',
    LOSS = 'loss',
    MARKET_CREATED = 'market_created',
    MARKET_ENDING_SOON = 'market_ending_soon',
    CLAIM_AVAILABLE = 'claim_available',
}

/**
 * Notification metadata interface
 */
export interface NotificationMetadata {
    marketId?: number;
    marketQuestion?: string;
    amount?: number;
    outcome?: number;
}

/**
 * Notification interface
 */
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    metadata?: NotificationMetadata;
}

import { Notification, NotificationType } from '../types/notification';

/**
 * Create a notification object
 * @param type - Notification type
 * @param data - Notification data
 * @returns Notification object (without id, timestamp, read)
 */
export function createNotification(
    type: NotificationType,
    data: { title: string; message: string; metadata?: Notification['metadata'] }
): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    return {
        type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
    };
}

/**
 * Get formatted message for notification
 * @param notification - Notification object
 * @returns Formatted message string
 */
export function getNotificationMessage(notification: Notification): string {
    return notification.message;
}

/**
 * Get icon component for notification type
 * @param type - Notification type
 * @returns SVG path for icon
 */
export function getNotificationIcon(type: NotificationType): JSX.Element {
    switch (type) {
        case NotificationType.STAKE:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule = "evenodd" />
                            </svg>
      );
        case NotificationType.WIN:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule = "evenodd" />
                        </svg>
      );
        case NotificationType.LOSS:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule = "evenodd" />
                        </svg>
      );
        case NotificationType.RESOLUTION:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule = "evenodd" />
                        </svg>
      );
        case NotificationType.MARKET_CREATED:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule = "evenodd" />
                        </svg>
      );
        case NotificationType.MARKET_ENDING_SOON:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule = "evenodd" />
                        </svg>
      );
        case NotificationType.CLAIM_AVAILABLE:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule = "evenodd" />
                            </svg>
      );
        default:
            return (
                <svg className= "w-5 h-5" fill = "currentColor" viewBox = "0 0 20 20" >
                    <path fillRule="evenodd" d = "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule = "evenodd" />
                        </svg>
      );
    }
}

export class PushNotificationService {
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async sendNotification(title: string, options?: NotificationOptions) {
        if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            if (registration) {
                registration.showNotification(title, {
                    icon: '/logo.png',
                    badge: '/badge.png',
                    ...options
                });
            } else {
                new Notification(title, options);
            }
        }
    }

    static async subscribeToMarket(marketId: number) {
        console.log(`Subscribed to notifications for market #${marketId}`);
        // In production, this would register the device token with a backend
    }

    static async unsubscribeFromMarket(marketId: number) {
        console.log(`Unsubscribed from notifications for market #${marketId}`);
    }
}

export const pushService = new PushNotificationService();

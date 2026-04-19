# Notifications API Reference

Complete API documentation for the notification system.

## Services

### NotificationService

Core service for managing all notifications.

#### `createNotification(notification: Notification): string`
Creates a new notification.

**Parameters:**
- `notification`: Notification object with userId, type, channel, title, message

**Returns:** Notification ID

**Example:**
```typescript
const id = NotificationService.createNotification({
  userId: 'user123',
  type: 'price_movement',
  channel: 'in_app',
  title: 'Price Alert',
  message: 'Bitcoin increased by 5%',
  metadata: { assetName: 'Bitcoin' }
});
```

#### `getNotifications(userId: string, filters?: NotificationFilter): Notification[]`
Retrieves notifications for a user.

**Parameters:**
- `userId`: User ID
- `filters`: Optional filters (read, archived, type, channel)

**Returns:** Array of notifications

**Example:**
```typescript
const notifications = NotificationService.getNotifications('user123');
const unreadNotifications = NotificationService.getNotifications('user123', { read: false });
```

#### `getNotificationById(id: string): Notification | undefined`
Gets a specific notification by ID.

**Parameters:**
- `id`: Notification ID

**Returns:** Notification or undefined

**Example:**
```typescript
const notification = NotificationService.getNotificationById('notif_id');
```

#### `getNotificationsByType(userId: string, type: NotificationType): Notification[]`
Gets all notifications of a specific type.

**Parameters:**
- `userId`: User ID
- `type`: Notification type

**Returns:** Array of notifications

**Example:**
```typescript
const priceAlerts = NotificationService.getNotificationsByType('user123', 'price_movement');
```

#### `markAsRead(id: string): boolean`
Marks a notification as read.

**Parameters:**
- `id`: Notification ID

**Returns:** Success status

**Example:**
```typescript
NotificationService.markAsRead('notif_id');
```

#### `markAsUnread(id: string): boolean`
Marks a notification as unread.

**Parameters:**
- `id`: Notification ID

**Returns:** Success status

**Example:**
```typescript
NotificationService.markAsUnread('notif_id');
```

#### `markAllAsRead(userId: string): number`
Marks all notifications as read for a user.

**Parameters:**
- `userId`: User ID

**Returns:** Number of notifications updated

**Example:**
```typescript
const count = NotificationService.markAllAsRead('user123');
```

#### `archiveNotification(id: string): boolean`
Archives a notification.

**Parameters:**
- `id`: Notification ID

**Returns:** Success status

**Example:**
```typescript
NotificationService.archiveNotification('notif_id');
```

#### `deleteNotification(id: string): boolean`
Deletes a notification.

**Parameters:**
- `id`: Notification ID

**Returns:** Success status

**Example:**
```typescript
NotificationService.deleteNotification('notif_id');
```

#### `deleteNotifications(ids: string[]): number`
Deletes multiple notifications.

**Parameters:**
- `ids`: Array of notification IDs

**Returns:** Number of notifications deleted

**Example:**
```typescript
const count = NotificationService.deleteNotifications(['id1', 'id2', 'id3']);
```

#### `deleteOldNotifications(daysOld: number): number`
Deletes notifications older than specified days.

**Parameters:**
- `daysOld`: Days threshold

**Returns:** Number of notifications deleted

**Example:**
```typescript
const deleted = NotificationService.deleteOldNotifications(30);
```

#### `setPreference(preference: NotificationPreference): boolean`
Sets a notification preference.

**Parameters:**
- `preference`: NotificationPreference object

**Returns:** Success status

**Example:**
```typescript
NotificationService.setPreference({
  userId: 'user123',
  type: 'price_movement',
  channel: 'email',
  enabled: true,
  frequency: 'daily'
});
```

#### `getUserPreferences(userId: string): NotificationPreference[]`
Gets all preferences for a user.

**Parameters:**
- `userId`: User ID

**Returns:** Array of preferences

**Example:**
```typescript
const preferences = NotificationService.getUserPreferences('user123');
```

#### `getPreference(userId: string, type: NotificationType, channel: NotificationChannel): NotificationPreference | undefined`
Gets a specific preference.

**Parameters:**
- `userId`: User ID
- `type`: Notification type
- `channel`: Notification channel

**Returns:** Preference or undefined

**Example:**
```typescript
const pref = NotificationService.getPreference('user123', 'price_movement', 'email');
```

#### `getNotificationStats(userId: string): NotificationStats`
Gets notification statistics for a user.

**Parameters:**
- `userId`: User ID

**Returns:** Statistics object

**Example:**
```typescript
const stats = NotificationService.getNotificationStats('user123');
// Returns: { total: 42, unread: 5, archived: 3, byType: {...} }
```

---

### EmailNotificationService

Service for sending formatted email notifications.

#### `sendEmail(payload: EmailPayload): Promise<boolean>`
Sends an email notification.

**Parameters:**
- `payload`: EmailPayload with to, subject, htmlBody, textBody

**Returns:** Promise<boolean>

**Example:**
```typescript
const sent = await EmailNotificationService.sendEmail({
  to: 'user@example.com',
  subject: 'Price Alert',
  htmlBody: '<p>Bitcoin increased</p>',
  textBody: 'Bitcoin increased'
});
```

#### `sendPriceMovementAlert(email: string, assetName: string, change: number, currentPrice: number, percentage: number): Promise<boolean>`
Sends a price movement alert.

**Parameters:**
- `email`: User email
- `assetName`: Asset name (e.g., 'Bitcoin')
- `change`: Price change amount
- `currentPrice`: Current asset price
- `percentage`: Percentage change

**Returns:** Promise<boolean>

**Example:**
```typescript
await EmailNotificationService.sendPriceMovementAlert(
  'user@example.com',
  'Bitcoin',
  5000,
  45000,
  12.5
);
```

#### `sendMarketExpiryReminder(email: string, marketName: string, daysUntilExpiry: number, marketUrl: string): Promise<boolean>`
Sends a market expiry reminder.

**Parameters:**
- `email`: User email
- `marketName`: Market name
- `daysUntilExpiry`: Days until expiration
- `marketUrl`: Market URL

**Returns:** Promise<boolean>

**Example:**
```typescript
await EmailNotificationService.sendMarketExpiryReminder(
  'user@example.com',
  'BTC Over $50k',
  7,
  'https://0xcast.io/markets/123'
);
```

#### `sendResolutionNotification(email: string, marketName: string, outcome: string, marketUrl: string): Promise<boolean>`
Sends a market resolution notification.

**Parameters:**
- `email`: User email
- `marketName`: Market name
- `outcome`: Resolution outcome
- `marketUrl`: Market URL

**Returns:** Promise<boolean>

**Example:**
```typescript
await EmailNotificationService.sendResolutionNotification(
  'user@example.com',
  'Bitcoin Market',
  'YES',
  'https://0xcast.io/markets/123'
);
```

#### `sendLiquidityRewardReminder(email: string, marketName: string, rewardAmount: number, claimUrl: string): Promise<boolean>`
Sends a liquidity reward notification.

**Parameters:**
- `email`: User email
- `marketName`: Market name
- `rewardAmount`: Reward amount in tokens
- `claimUrl`: URL to claim reward

**Returns:** Promise<boolean>

**Example:**
```typescript
await EmailNotificationService.sendLiquidityRewardReminder(
  'user@example.com',
  'Ethereum Market',
  1000,
  'https://0xcast.io/rewards/claim'
);
```

#### `sendBulkEmails(payloads: EmailPayload[]): Promise<number>`
Sends multiple emails.

**Parameters:**
- `payloads`: Array of EmailPayload objects

**Returns:** Promise<number> - Count of successfully sent emails

**Example:**
```typescript
const sent = await EmailNotificationService.sendBulkEmails([
  { to: 'user1@example.com', subject: '...', htmlBody: '...', textBody: '...' },
  { to: 'user2@example.com', subject: '...', htmlBody: '...', textBody: '...' }
]);
```

---

### PushNotificationService

Service for browser push notifications.

#### `requestPermission(): Promise<NotificationPermission>`
Requests push notification permission.

**Returns:** Promise<NotificationPermission>

**Example:**
```typescript
const permission = await PushNotificationService.requestPermission();
if (permission === 'granted') {
  // User approved
}
```

#### `hasPermission(): Promise<boolean>`
Checks if push notifications are enabled.

**Returns:** Promise<boolean>

**Example:**
```typescript
const allowed = await PushNotificationService.hasPermission();
```

#### `sendNotification(options: PushNotificationOptions): Promise<boolean>`
Sends a push notification.

**Parameters:**
- `options`: PushNotificationOptions with title, body, icon, etc.

**Returns:** Promise<boolean>

**Example:**
```typescript
await PushNotificationService.sendNotification({
  title: 'Price Alert',
  body: 'Bitcoin increased by 5%',
  icon: '/icons/bitcoin.png'
});
```

#### `sendPriceMovementNotification(assetName: string, change: number, percentage: number, priorityLevel: number): Promise<boolean>`
Sends a price movement push notification.

**Parameters:**
- `assetName`: Asset name
- `change`: Price change
- `percentage`: Percentage change
- `priorityLevel`: Priority (1-3)

**Returns:** Promise<boolean>

**Example:**
```typescript
await PushNotificationService.sendPriceMovementNotification(
  'Bitcoin',
  5000,
  12.5,
  1
);
```

#### `sendMarketExpiryNotification(marketName: string, daysUntilExpiry: number, marketId: string): Promise<boolean>`
Sends a market expiry push notification.

**Parameters:**
- `marketName`: Market name
- `daysUntilExpiry`: Days until expiration
- `marketId`: Market ID

**Returns:** Promise<boolean>

**Example:**
```typescript
await PushNotificationService.sendMarketExpiryNotification(
  'BTC Over $50k',
  7,
  '123'
);
```

#### `sendBulkNotifications(payloads: PushNotificationOptions[]): Promise<number>`
Sends multiple push notifications.

**Parameters:**
- `payloads`: Array of PushNotificationOptions

**Returns:** Promise<number> - Count of successfully sent notifications

**Example:**
```typescript
const sent = await PushNotificationService.sendBulkNotifications([
  { title: 'Alert 1', body: 'Test' },
  { title: 'Alert 2', body: 'Test' }
]);
```

---

## Hooks

### useNotifications

Hook for managing notifications in React components.

```typescript
const {
  notifications,     // Notification[]
  unreadCount,       // number
  loading,           // boolean
  error,             // Error | null
  markAsRead,        // (id: string) => void
  markAsUnread,      // (id: string) => void
  archiveNotification, // (id: string) => void
  deleteNotification,  // (id: string) => void
  clearAll,          // () => void
  getByType,         // (type: NotificationType) => Notification[]
  refresh            // () => Promise<void>
} = useNotifications('user123');
```

### useNotificationPreferences

Hook for managing notification preferences.

```typescript
const {
  preferences,       // NotificationPreference[]
  loading,           // boolean
  error,             // Error | null
  toggleType,        // (type: NotificationType, channel: NotificationChannel) => void
  setFrequency,      // (type, channel, frequency) => void
  isEnabled,         // (type, channel) => boolean
  getFrequency,      // (type, channel) => string
  enableAll,         // () => void
  disableAll,        // () => void
  resetToDefaults,   // () => void
  refresh            // () => Promise<void>
} = useNotificationPreferences('user123');
```

---

## Types

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}
```

### NotificationPreference
```typescript
interface NotificationPreference {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  frequency: NotificationFrequency;
}
```

### NotificationType
```typescript
type NotificationType = 
  | 'price_movement'
  | 'market_expiry'
  | 'resolution'
  | 'liquidity_reward'
  | 'portfolio_update'
  | 'system_alert'
  | 'promotion';
```

### NotificationChannel
```typescript
type NotificationChannel = 
  | 'in_app'
  | 'email'
  | 'push';
```

### NotificationFrequency
```typescript
type NotificationFrequency = 
  | 'immediate'
  | 'hourly'
  | 'daily'
  | 'weekly';
```

---

## Constants

### Default Preferences
```typescript
DEFAULT_NOTIFICATION_PREFERENCES
```

### Notification Types
```typescript
NOTIFICATION_TYPES = {
  PRICE_MOVEMENT: 'price_movement',
  MARKET_EXPIRY: 'market_expiry',
  RESOLUTION: 'resolution',
  LIQUIDITY_REWARD: 'liquidity_reward',
  PORTFOLIO_UPDATE: 'portfolio_update',
  SYSTEM_ALERT: 'system_alert',
  PROMOTION: 'promotion'
}
```

### Channels
```typescript
NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push'
}
```

### Frequencies
```typescript
NOTIFICATION_FREQUENCIES = {
  IMMEDIATE: 'immediate',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly'
}
```

---

## Error Handling

All services implement error handling with try-catch blocks. Errors are logged to console and returned gracefully.

```typescript
try {
  await EmailNotificationService.sendEmail(payload);
} catch (error) {
  console.error('Email send failed:', error);
}
```

---

## Rate Limiting

Email notifications are rate-limited:
- Maximum 50 bulk emails per request
- Maximum 1000 notifications per user

Push notifications are limited by browser API.

---

## Data Validation

All inputs are validated before processing:
- Email addresses validated with regex
- Notification types checked against enum
- Channels and frequencies validated
- Negative values converted to absolute

---

## Async Operations

All async operations return Promises:
```typescript
await EmailNotificationService.sendEmail(payload);
await PushNotificationService.sendNotification(options);
```

---

Last Updated: 2024

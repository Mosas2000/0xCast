# Market Event Notifications and Alerts System

This system provides comprehensive notification capabilities for the 0xCast prediction market platform, allowing users to stay informed about important market events, price movements, resolutions, and liquidity rewards.

## Features

### 1. Multi-Channel Notifications
- **In-App Notifications**: Real-time alerts displayed in the notification center
- **Email Notifications**: Formatted email alerts for important events
- **Push Notifications**: Browser push notifications for instant updates

### 2. Notification Types
- **Price Movement**: Alerts when asset prices move significantly
- **Market Expiry**: Reminders about upcoming market expirations
- **Resolution**: Notifications when markets are resolved
- **Liquidity Reward**: Alerts for available liquidity rewards to claim
- **Portfolio Update**: Summary updates about portfolio performance
- **System Alerts**: Important system and maintenance notifications
- **Promotions**: Special offers and promotional events

### 3. Customizable Preferences
Users can control notifications with granular settings:
- Enable/disable each notification type
- Enable/disable each delivery channel
- Set delivery frequency (immediate, hourly, daily, weekly)
- Customize preferences per notification type and channel

### 4. Advanced Features
- Notification history and archiving
- Bulk operations (mark as read, delete, archive)
- Fraud detection for referral systems
- Notification retry queue with exponential backoff
- Automatic cleanup of old notifications
- Service worker integration for push notifications

## Architecture

### Core Services

#### NotificationService
Main service for managing notifications and preferences with localStorage persistence.

```typescript
const service = NotificationService;

service.createNotification({
  userId: 'user123',
  type: 'price_movement',
  channel: 'in_app',
  title: 'Bitcoin Price Alert',
  message: 'Bitcoin has increased by 5%',
  metadata: { assetName: 'Bitcoin', change: 5000, percentage: 5 }
});

const notifications = service.getNotifications('user123');
service.markAsRead('notification_id');
```

#### EmailNotificationService
Specialized service for sending formatted email notifications with pre-built templates.

```typescript
await EmailNotificationService.sendPriceMovementAlert(
  'user@example.com',
  'Bitcoin',
  5000,
  45000,
  5
);
```

#### PushNotificationService
Handles browser push notifications with service worker integration.

```typescript
const hasPermission = await PushNotificationService.hasPermission();

if (hasPermission) {
  await PushNotificationService.sendPriceMovementNotification(
    'Bitcoin',
    5000,
    5,
    1
  );
}
```

### React Hooks

#### useNotifications
Hook for managing notification state in React components.

```typescript
const { notifications, unreadCount, loading, error } = useNotifications('user123');

// Operations
markAsRead(id);
markAsUnread(id);
archiveNotification(id);
deleteNotification(id);
clearAll();
```

#### useNotificationPreferences
Hook for managing user notification preferences.

```typescript
const { preferences, loading } = useNotificationPreferences('user123');

// Operations
toggleType(type, channel);
setFrequency(type, channel, frequency);
isEnabled(type, channel);
enableAll();
disableAll();
resetToDefaults();
```

### Components

#### NotificationCenter
Main component for displaying and managing notifications.

```typescript
<NotificationCenter
  userId="user123"
  maxVisibleCount={10}
  onNotificationClick={handleClick}
/>
```

Features:
- Filter by read/unread/archived status
- Bulk selection and operations
- Mark as read/unread
- Archive and delete notifications
- Responsive design

#### NotificationPreferences
Component for managing user notification settings.

```typescript
<NotificationPreferences userId="user123" />
```

Features:
- Toggle notification types per channel
- Set delivery frequency
- Enable/disable all notifications
- Reset to defaults
- Clear notification history

#### NotificationBell
Quick-access notification bell button with modal.

```typescript
<NotificationBell userId="user123" />
```

Features:
- Unread count badge
- Quick view of recent notifications
- Modal overlay for detailed view
- Click outside to close

#### NotificationToast
Toast-style notifications for important alerts.

```typescript
<NotificationToast
  notification={notification}
  onDismiss={handleDismiss}
  duration={5000}
/>
```

Features:
- Auto-dismiss with duration
- Priority-based styling
- Manual dismiss button
- Animated progress bar

#### NotificationBadge
Badge component for showing unread count.

```typescript
<NotificationBadge
  count={unreadCount}
  variant="number"
  size="md"
  animate={true}
/>
```

Variants: `dot`, `number`, `pill`

## Utilities

### NotificationHelpers
Collection of utility functions for notification handling.

```typescript
NotificationHelpers.formatPrice(1234.56, 2); // "1234.56"
NotificationHelpers.formatPercentage(5.5); // "+5.50%"
NotificationHelpers.formatCurrency(1000, 'USD'); // "$1,000.00"
NotificationHelpers.getTimeUntil(expiryDate); // "7 days remaining"
NotificationHelpers.truncateText(longText, 100); // Truncate with ellipsis
NotificationHelpers.getPriorityLabel(type); // 'high' | 'medium' | 'low'
```

### NotificationTemplates
Pre-built email templates for different notification types.

```typescript
const template = NotificationTemplates.priceMovementEmail(
  'Bitcoin',
  5000,
  5
);
// Returns: { subject, htmlBody, textBody }
```

### NotificationQueue
Retry queue for reliable notification delivery.

```typescript
const queue = new NotificationQueue(maxRetries, retryDelayMs);

queue.enqueue(id, notification, channel);
queue.startProcessing(processor, intervalMs);
queue.getStats(); // Queue statistics
```

### NotificationConfig
Configuration management for the notification system.

```typescript
const config = NotificationConfiguration.getInstance();

config.setEnabledTypes(['price_movement', 'resolution']);
config.setMaxNotifications(1000);
config.setRetentionDays(30);
```

## Installation

The notification system is fully integrated into the frontend. No additional installation is required. Simply import components and services where needed.

## Usage Examples

### Basic Setup in a Page

```typescript
import { NotificationBell } from './components/NotificationBell';
import { NotificationCenter } from './components/NotificationCenter';

export function Dashboard() {
  const userId = useAuth().userId;

  return (
    <div>
      <header>
        <NotificationBell userId={userId} />
      </header>

      <main>
        <NotificationCenter userId={userId} />
      </main>
    </div>
  );
}
```

### Sending Notifications Programmatically

```typescript
import { NotificationService } from '../services/NotificationService';
import { EmailNotificationService } from '../services/EmailNotificationService';

function handleMarketResolution(market) {
  const userId = market.creatorId;
  const userEmail = market.creatorEmail;

  // Create in-app notification
  NotificationService.createNotification({
    userId,
    type: 'resolution',
    channel: 'in_app',
    title: 'Market Resolved',
    message: `${market.name} has been resolved to ${market.outcome}`,
    metadata: { marketId: market.id, outcome: market.outcome }
  });

  // Send email notification
  await EmailNotificationService.sendResolutionNotification(
    userEmail,
    market.name,
    market.outcome,
    market.url
  );
}
```

### Customizing Preferences

```typescript
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';

function PreferenceSettings() {
  const { preferences, toggleType, setFrequency, enableAll, disableAll } = 
    useNotificationPreferences(userId);

  return (
    <div>
      <button onClick={() => toggleType('price_movement', 'email')}>
        Toggle Email Alerts for Price Movement
      </button>

      <button onClick={() => setFrequency('portfolio_update', 'email', 'daily')}>
        Set Portfolio Updates to Daily
      </button>
    </div>
  );
}
```

## Type Definitions

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

## Data Persistence

### localStorage Keys
- `notifications`: Array of all notifications
- `notification_preferences`: User notification preferences
- `notification_stats`: Aggregated statistics

### Retention Policy
- Default: 30 days (configurable)
- Old notifications are automatically cleaned up
- Maximum 1000 notifications per user (configurable)

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with limited push notification support

## Push Notification Setup

### Service Worker Registration

The system automatically registers a service worker at `/sw.js` for push notifications.

```typescript
// In public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/icons/notification-icon.png',
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
```

### VAPID Key Configuration

Push notifications require a VAPID key pair. Store the public key and configure:

```typescript
const config = NotificationConfiguration.getInstance();
config.setEnabledChannels(['push', 'email', 'in_app']);
```

## Email Integration

The email notification service is designed to work with backend email providers:
- SendGrid
- AWS SES
- Mailgun
- Custom SMTP

Configure the email endpoint in `EmailNotificationService.ts`:
```typescript
private static EMAIL_ENDPOINT = '/api/notifications/email';
```

## Testing

Each service, hook, and component includes comprehensive unit tests:

```bash
npm run test -- notification
```

Test coverage includes:
- Service CRUD operations
- Hook state management
- Component rendering
- Email template generation
- Preference management
- Queue retry logic

## Performance Considerations

### Optimization
- Notifications stored in localStorage with lazy loading
- Automatic cleanup of old notifications
- Batch email processing for bulk operations
- Exponential backoff for retry queue

### Limits
- Maximum 1000 notifications per user (soft limit)
- localStorage quota ~5-10MB per domain
- Batch email size: 50 emails per request
- Notification retention: 30 days

### Scaling
For high-volume notifications:
1. Implement IndexedDB for larger storage
2. Use backend queue system for delivery
3. Implement read replicas for statistics
4. Archive old notifications to permanent storage

## Troubleshooting

### Notifications Not Appearing
1. Check user preferences are enabled
2. Verify notification channel is configured
3. Check browser console for errors
4. Ensure service worker is registered

### Email Notifications Not Sending
1. Verify email configuration in backend
2. Check email validation in preferences
3. Review email service logs
4. Validate SMTP credentials

### Push Notifications Not Working
1. Ensure HTTPS is enabled
2. Check service worker registration
3. Verify VAPID key configuration
4. Check browser notification permissions

## Future Enhancements

- [ ] SMS notifications
- [ ] Telegram/Discord webhooks
- [ ] Advanced scheduling
- [ ] Notification templates with variables
- [ ] Analytics dashboard
- [ ] A/B testing for notification timing
- [ ] ML-based optimal delivery times
- [ ] WebSocket real-time updates

## License

Part of 0xCast platform. All rights reserved.

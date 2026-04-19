# Notifications Integration Examples

Real-world examples of integrating the notification system into 0xCast.

## Table of Contents
1. [Dashboard Integration](#dashboard-integration)
2. [Market Events](#market-events)
3. [Portfolio Tracking](#portfolio-tracking)
4. [Reward Claims](#reward-claims)
5. [Trading Operations](#trading-operations)
6. [System Events](#system-events)

## Dashboard Integration

### Adding Notification Bell to Header

```typescript
// components/Header.tsx
import { NotificationBell } from '@/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="logo">0xCast</div>

      <nav className="flex items-center gap-4">
        <NotificationBell userId={user.id} />
      </nav>
    </header>
  );
}
```

### Displaying Notifications in Dashboard

```typescript
// pages/Dashboard.tsx
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        {/* Main dashboard content */}
      </div>

      <aside>
        <NotificationCenter
          userId={user.id}
          maxVisibleCount={5}
        />
      </aside>
    </div>
  );
}
```

### Toast Notifications in App

```typescript
// pages/Layout.tsx
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationToast } from '@/components/NotificationToast';

export function Layout({ children }) {
  const { notifications, deleteNotification } = useNotifications(userId);
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read && n.channel === 'in_app');
    setVisibleToasts(unreadNotifications.slice(0, 3));
  }, [notifications]);

  return (
    <div>
      {children}

      <div className="fixed bottom-4 right-4 space-y-2">
        {visibleToasts.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={deleteNotification}
            duration={5000}
          />
        ))}
      </div>
    </div>
  );
}
```

## Market Events

### Market Expiry Alerts

```typescript
// services/marketService.ts
import { NotificationService } from '@/services/NotificationService';
import { EmailNotificationService } from '@/services/EmailNotificationService';

export async function notifyMarketExpiry(market) {
  const daysUntilExpiry = Math.ceil(
    (market.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
    // Notify all traders
    for (const trader of market.traders) {
      NotificationService.createNotification({
        userId: trader.id,
        type: 'market_expiry',
        channel: 'in_app',
        title: `${market.name} Expiring Soon`,
        message: `This market expires in ${daysUntilExpiry} days. Close your positions or the market will be resolved.`,
        metadata: {
          marketId: market.id,
          marketName: market.name,
          daysUntilExpiry
        }
      });

      // Email notification
      await EmailNotificationService.sendMarketExpiryReminder(
        trader.email,
        market.name,
        daysUntilExpiry,
        `https://0xcast.io/markets/${market.id}`
      );
    }
  }
}
```

### Market Resolution Notifications

```typescript
// services/resolutionService.ts
import { NotificationService } from '@/services/NotificationService';
import { EmailNotificationService } from '@/services/EmailNotificationService';
import { PushNotificationService } from '@/services/PushNotificationService';

export async function notifyMarketResolution(market, outcome) {
  const traders = await getMarketTraders(market.id);

  for (const trader of traders) {
    const userPosition = trader.positions.find(p => p.marketId === market.id);

    // Create in-app notification
    NotificationService.createNotification({
      userId: trader.id,
      type: 'resolution',
      channel: 'in_app',
      title: 'Market Resolved',
      message: `${market.name} has been resolved to ${outcome}. ${userPosition?.isWinner ? 'You won!' : 'Better luck next time.'}`,
      metadata: {
        marketId: market.id,
        marketName: market.name,
        outcome,
        isWinner: userPosition?.isWinner
      }
    });

    // Send email notification
    await EmailNotificationService.sendResolutionNotification(
      trader.email,
      market.name,
      outcome,
      `https://0xcast.io/markets/${market.id}`
    );

    // Send push notification if enabled
    const preferences = NotificationService.getPreference(
      trader.id,
      'resolution',
      'push'
    );

    if (preferences?.enabled) {
      await PushNotificationService.sendResolutionNotification(
        market.name,
        outcome,
        market.id
      );
    }
  }
}
```

### Price Movement Alerts

```typescript
// services/priceService.ts
import { NotificationService } from '@/services/NotificationService';
import { PushNotificationService } from '@/services/PushNotificationService';

const PRICE_CHANGE_THRESHOLD = 5; // 5% change

export async function monitorPriceMovement(assetName, previousPrice, currentPrice) {
  const changePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;

  if (Math.abs(changePercentage) >= PRICE_CHANGE_THRESHOLD) {
    const change = currentPrice - previousPrice;
    const watchers = await getAssetWatchers(assetName);

    for (const user of watchers) {
      const preferences = NotificationService.getPreference(
        user.id,
        'price_movement',
        'in_app'
      );

      if (preferences?.enabled) {
        NotificationService.createNotification({
          userId: user.id,
          type: 'price_movement',
          channel: 'in_app',
          title: `${assetName} Price Alert`,
          message: `${assetName} has moved ${changePercentage >= 0 ? 'up' : 'down'} ${Math.abs(changePercentage).toFixed(2)}%`,
          metadata: {
            assetName,
            change: Math.round(change),
            previousPrice,
            currentPrice,
            changePercentage: Math.round(changePercentage * 100) / 100
          }
        });

        // Push notification
        await PushNotificationService.sendPriceMovementNotification(
          assetName,
          Math.round(change),
          Math.round(changePercentage * 100) / 100,
          Math.abs(changePercentage) >= 10 ? 1 : 2
        );
      }
    }
  }
}
```

## Portfolio Tracking

### Portfolio Performance Summaries

```typescript
// services/portfolioService.ts
import { NotificationService } from '@/services/NotificationService';
import { EmailNotificationService } from '@/services/EmailNotificationService';

export async function sendDailyPortfolioUpdate(userId) {
  const portfolio = await getUserPortfolio(userId);
  const user = await getUser(userId);

  const totalValue = portfolio.positions.reduce((sum, p) => sum + p.value, 0);
  const totalGain = portfolio.positions.reduce((sum, p) => sum + p.gain, 0);
  const gainPercentage = (totalGain / portfolio.initialValue) * 100;

  NotificationService.createNotification({
    userId,
    type: 'portfolio_update',
    channel: 'in_app',
    title: 'Daily Portfolio Update',
    message: `Your portfolio is worth ${totalValue.toFixed(2)} USDC (${gainPercentage >= 0 ? '+' : ''}${gainPercentage.toFixed(2)}%)`,
    metadata: {
      totalValue,
      totalGain,
      gainPercentage,
      positionCount: portfolio.positions.length
    }
  });

  // Email update
  const preferences = NotificationService.getPreference(userId, 'portfolio_update', 'email');
  if (preferences?.enabled) {
    await EmailNotificationService.sendPortfolioUpdateSummary(
      user.email,
      totalValue,
      totalGain,
      gainPercentage,
      'https://0xcast.io/portfolio'
    );
  }
}
```

## Reward Claims

### Liquidity Reward Notifications

```typescript
// services/rewardService.ts
import { NotificationService } from '@/services/NotificationService';
import { EmailNotificationService } from '@/services/EmailNotificationService';

export async function notifyRewardAvailable(userId, marketId, marketName, rewardAmount) {
  const user = await getUser(userId);

  // In-app notification
  NotificationService.createNotification({
    userId,
    type: 'liquidity_reward',
    channel: 'in_app',
    title: 'Reward Available',
    message: `You have earned ${rewardAmount.toFixed(2)} USDC in liquidity rewards for ${marketName}. Claim before expiration.`,
    metadata: {
      marketId,
      marketName,
      rewardAmount,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Email notification
  await EmailNotificationService.sendLiquidityRewardReminder(
    user.email,
    marketName,
    rewardAmount,
    `https://0xcast.io/rewards/claim`
  );
}

export async function reminderUnclaimedRewards() {
  const unclaimedRewards = await getAllUnclaimedRewards();

  for (const reward of unclaimedRewards) {
    const daysUntilExpiry = Math.ceil(
      (reward.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry === 3 || daysUntilExpiry === 1) {
      const user = await getUser(reward.userId);

      NotificationService.createNotification({
        userId: reward.userId,
        type: 'liquidity_reward',
        channel: 'in_app',
        title: 'Reward Expiring Soon',
        message: `Your ${reward.amount.toFixed(2)} USDC reward expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Claim now!`,
        metadata: {
          marketId: reward.marketId,
          rewardId: reward.id,
          daysUntilExpiry
        }
      });
    }
  }
}
```

## Trading Operations

### Trade Confirmation Notifications

```typescript
// services/tradeService.ts
import { NotificationService } from '@/services/NotificationService';

export async function notifyTradeExecution(trade) {
  NotificationService.createNotification({
    userId: trade.userId,
    type: 'portfolio_update',
    channel: 'in_app',
    title: 'Trade Executed',
    message: `${trade.shares} shares of ${trade.marketName} purchased at ${trade.price} USDC each`,
    metadata: {
      tradeId: trade.id,
      marketId: trade.marketId,
      type: 'buy',
      shares: trade.shares,
      price: trade.price,
      total: trade.shares * trade.price
    }
  });
}

export async function notifyLiquidationWarning(position) {
  NotificationService.createNotification({
    userId: position.userId,
    type: 'system_alert',
    channel: 'in_app',
    title: 'Liquidation Warning',
    message: `Your position in ${position.marketName} is at risk of liquidation. Margin: ${position.margin}%`,
    metadata: {
      positionId: position.id,
      margin: position.margin,
      liquidationPrice: position.liquidationPrice
    }
  });
}
```

## System Events

### System Maintenance Alerts

```typescript
// services/systemService.ts
import { NotificationService } from '@/services/NotificationService';

export async function notifySystemMaintenance(startTime, duration, affectedServices) {
  const users = await getAllActiveUsers();

  for (const user of users) {
    NotificationService.createNotification({
      userId: user.id,
      type: 'system_alert',
      channel: 'in_app',
      title: 'Scheduled Maintenance',
      message: `${affectedServices.join(', ')} will be offline for maintenance starting at ${startTime.toLocaleString()} for ~${duration} minutes`,
      metadata: {
        startTime,
        duration,
        affectedServices,
        severity: 'warning'
      }
    });
  }
}

export async function notifyEmergencyAlert(message, severity) {
  const users = await getAllActiveUsers();

  for (const user of users) {
    NotificationService.createNotification({
      userId: user.id,
      type: 'system_alert',
      channel: 'in_app',
      title: 'Emergency Alert',
      message,
      metadata: {
        severity,
        timestamp: new Date(),
        isEmergency: true
      }
    });
  }
}
```

### Notification Preference Management Page

```typescript
// pages/NotificationSettings.tsx
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { useAuth } from '@/hooks/useAuth';

export function NotificationSettings() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>

      <NotificationPreferences userId={user.id} />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">Help</h3>
        <p className="text-sm text-gray-600">
          Control how and when you receive notifications. You can enable or disable
          each notification type and choose your preferred delivery channels.
        </p>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Check User Preferences Before Sending

```typescript
const preference = NotificationService.getPreference(userId, 'price_movement', 'email');
if (preference?.enabled) {
  await EmailNotificationService.sendPriceMovementAlert(...);
}
```

### 2. Use Batch Operations for Bulk Notifications

```typescript
const emails = users.map(u => ({
  to: u.email,
  subject: '...',
  htmlBody: '...',
  textBody: '...'
}));

await EmailNotificationService.sendBulkEmails(emails);
```

### 3. Include Relevant Metadata

```typescript
NotificationService.createNotification({
  // ... required fields
  metadata: {
    marketId: market.id,
    marketName: market.name,
    tradeId: trade.id,
    position: 'YES'
  }
});
```

### 4. Handle Notification Failures Gracefully

```typescript
try {
  await EmailNotificationService.sendEmail(payload);
} catch (error) {
  console.error('Failed to send email:', error);
  // Queue for retry
  queue.enqueue(id, payload, 'email');
}
```

### 5. Clean Up Old Notifications

```typescript
// Run daily cleanup job
setInterval(() => {
  const deleted = NotificationService.deleteOldNotifications(30);
  console.log(`Cleaned up ${deleted} old notifications`);
}, 24 * 60 * 60 * 1000);
```

---

Last Updated: 2024

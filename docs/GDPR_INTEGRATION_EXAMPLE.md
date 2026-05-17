# GDPR Integration Example

This document provides practical examples of integrating GDPR compliance services into your application.

## Basic Setup

### 1. Initialize GDPR Services on App Start

```typescript
// src/App.tsx or main entry point
import { useEffect } from 'react';
import { DataRetentionService } from './services/DataRetentionService';
import { SecureStorageService } from './services/SecureStorageService';

function App() {
  useEffect(() => {
    // Schedule automatic cleanup on app initialization
    DataRetentionService.scheduleAutomaticCleanup();
    
    // Clear expired data immediately
    SecureStorageService.clearExpired();
  }, []);

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

### 2. Display Consent Banner

```typescript
// src/components/App.tsx
import { GDPRConsentBanner } from './components/GDPRConsentBanner';
import { GDPRComplianceService } from './services/GDPRComplianceService';

function App() {
  const [showBanner, setShowBanner] = useState(
    !GDPRComplianceService.hasAnyConsent()
  );

  return (
    <div>
      {showBanner && (
        <GDPRConsentBanner onClose={() => setShowBanner(false)} />
      )}
      {/* Rest of your app */}
    </div>
  );
}
```

## Using SecureStorageService

### Store User Preferences

```typescript
import { SecureStorageService } from '../services/SecureStorageService';

// Store personalization data (requires consent)
function saveThemePreference(theme: string) {
  const success = SecureStorageService.setItem(
    'user_theme',
    theme,
    {
      category: 'personalization',
      requireConsent: true,
      expiresIn: 90 * 24 * 60 * 60 * 1000, // 90 days
    }
  );

  if (!success) {
    console.warn('Theme preference not saved - user consent required');
  }
}

// Retrieve preference
function getThemePreference(): string | null {
  return SecureStorageService.getItem<string>('user_theme');
}
```

### Store Analytics Data

```typescript
import { SecureStorageService } from '../services/SecureStorageService';

function trackPageView(page: string) {
  const success = SecureStorageService.setItem(
    'last_page_view',
    {
      page,
      timestamp: Date.now(),
    },
    {
      category: 'analytics',
      requireConsent: true,
      expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  );

  if (!success) {
    console.warn('Analytics tracking blocked - user consent required');
  }
}
```

### Store Necessary Data (No Consent Required)

```typescript
import { SecureStorageService } from '../services/SecureStorageService';

function saveWalletConnection(address: string) {
  // Necessary data for contract execution
  SecureStorageService.setItem(
    'wallet_address',
    address,
    {
      category: 'necessary',
      requireConsent: false, // No consent needed for necessary data
    }
  );
}
```

## Using GDPRComplianceService

### Check Consent Before Processing

```typescript
import { GDPRComplianceService } from '../services/GDPRComplianceService';

function sendMarketingEmail(email: string) {
  const consentCheck = GDPRComplianceService.checkConsentForStorage(
    { email },
    'marketing'
  );

  if (!consentCheck.allowed) {
    console.warn('Marketing email blocked:', consentCheck.reason);
    // Show consent request UI
    return;
  }

  // Proceed with sending email
  sendEmail(email);
}
```

### Update User Consent

```typescript
import { GDPRComplianceService } from '../services/GDPRComplianceService';

function handleConsentUpdate(preferences: {
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}) {
  GDPRComplianceService.updateConsent(preferences);
  
  // Clear data for categories that were disabled
  if (!preferences.analytics) {
    SecureStorageService.clear('analytics');
  }
  if (!preferences.marketing) {
    SecureStorageService.clear('marketing');
  }
  if (!preferences.personalization) {
    SecureStorageService.clear('personalization');
  }
}
```

## Using DataExportService

### Export User Data

```typescript
import { DataExportService } from '../services/DataExportService';

async function handleDataExportRequest(format: 'json' | 'csv') {
  try {
    const blob = await DataExportService.exportAllData(format);
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Data export failed:', error);
  }
}
```

### Export Specific Data Category

```typescript
import { DataExportService } from '../services/DataExportService';

async function exportTransactionHistory() {
  const transactions = getTransactionHistory();
  const blob = await DataExportService.exportData(
    { transactions },
    'json'
  );
  
  // Download the file
  downloadBlob(blob, 'transactions.json');
}
```

## Using DataDeletionService

### Handle Right to be Forgotten

```typescript
import { DataDeletionService } from '../services/DataDeletionService';

async function handleAccountDeletion(userId: string) {
  const result = await DataDeletionService.deleteAllUserData(userId);
  
  if (result.success) {
    console.log('Deleted items:', result.deletedItems);
    // Redirect to goodbye page
    window.location.href = '/account-deleted';
  } else {
    console.error('Deletion failed:', result.errors);
  }
}
```

### Delete Specific Data Category

```typescript
import { DataDeletionService } from '../services/DataDeletionService';

async function deleteAnalyticsData() {
  const result = await DataDeletionService.deleteDataByCategory('analytics');
  
  if (result.success) {
    console.log(`Deleted ${result.deletedItems.length} analytics items`);
  }
}
```

## Using DataRetentionService

### Register Data with Retention Policy

```typescript
import { DataRetentionService } from '../services/DataRetentionService';

function saveUserActivity(activity: any) {
  const key = `activity_${Date.now()}`;
  
  // Store with automatic retention
  DataRetentionService.setWithRetention(
    key,
    activity,
    {
      category: 'analytics',
      retentionDays: 30,
    }
  );
}
```

### Manual Cleanup

```typescript
import { DataRetentionService } from '../services/DataRetentionService';

function cleanupOldData() {
  const result = DataRetentionService.cleanupExpiredData();
  console.log(`Cleaned up ${result.deletedCount} expired items`);
}
```

## Privacy Dashboard Integration

### Add Privacy Dashboard to Settings

```typescript
import { GDPRPrivacyDashboard } from '../components/GDPRPrivacyDashboard';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      
      <section>
        <h2>Privacy & Data</h2>
        <GDPRPrivacyDashboard />
      </section>
      
      {/* Other settings */}
    </div>
  );
}
```

## Complete Example: User Profile Component

```typescript
import { useState, useEffect } from 'react';
import { SecureStorageService } from '../services/SecureStorageService';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import { DataExportService } from '../services/DataExportService';
import { DataDeletionService } from '../services/DataDeletionService';

interface UserProfile {
  displayName: string;
  theme: string;
  notifications: boolean;
}

function UserProfileComponent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check consent status
    setHasConsent(GDPRComplianceService.isPersonalizationEnabled());
    
    // Load profile if consent given
    if (hasConsent) {
      const stored = SecureStorageService.getItem<UserProfile>('user_profile');
      setProfile(stored);
    }
  }, [hasConsent]);

  const saveProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates } as UserProfile;
    
    const success = SecureStorageService.setItem(
      'user_profile',
      newProfile,
      {
        category: 'personalization',
        requireConsent: true,
        expiresIn: 90 * 24 * 60 * 60 * 1000,
      }
    );

    if (success) {
      setProfile(newProfile);
    } else {
      alert('Please enable personalization to save your profile');
    }
  };

  const exportData = async () => {
    const blob = await DataExportService.exportAllData('json');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete all your data?')) {
      const result = await DataDeletionService.deleteAllUserData('current-user');
      if (result.success) {
        window.location.href = '/goodbye';
      }
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      
      {!hasConsent && (
        <div className="consent-warning">
          Enable personalization to save your profile preferences
        </div>
      )}
      
      {profile && (
        <div>
          <input
            value={profile.displayName}
            onChange={(e) => saveProfile({ displayName: e.target.value })}
            placeholder="Display Name"
          />
          
          <select
            value={profile.theme}
            onChange={(e) => saveProfile({ theme: e.target.value })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      )}
      
      <div className="privacy-actions">
        <button onClick={exportData}>Export My Data</button>
        <button onClick={deleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}
```

## Best Practices

1. **Always check consent before storing PII**
   - Use `GDPRComplianceService.checkConsentForStorage()` before storing sensitive data
   - Provide clear feedback when storage is blocked

2. **Use appropriate categories**
   - `necessary`: Essential for app functionality (no consent required)
   - `analytics`: Usage tracking and performance monitoring
   - `marketing`: Promotional communications
   - `personalization`: User preferences and customization

3. **Set appropriate retention periods**
   - Analytics: 30 days
   - Personalization: 90 days
   - Marketing: 60 days
   - Necessary: Session or as needed

4. **Initialize cleanup on app start**
   - Schedule automatic cleanup with `DataRetentionService.scheduleAutomaticCleanup()`
   - Clear expired data immediately with `SecureStorageService.clearExpired()`

5. **Provide user controls**
   - Add privacy dashboard to settings
   - Allow users to export their data
   - Implement account deletion

6. **Handle consent updates**
   - Clear data when consent is revoked
   - Re-request consent when privacy policy changes
   - Keep consent history for audit trail

## Testing Checklist

- [ ] Consent banner appears on first visit
- [ ] Data storage is blocked without consent
- [ ] Consent preferences are persisted
- [ ] Data export includes all user data
- [ ] Account deletion removes all data
- [ ] Expired data is automatically cleaned up
- [ ] Privacy dashboard displays correct status
- [ ] Consent history is tracked
- [ ] PII detection works correctly
- [ ] Retention policies are enforced

# Encrypted localStorage Storage — Implementation Guide

## Issue Reference
**Issue #164**: Implement encryption for sensitive localStorage data

## Problem

The application was storing sensitive data in localStorage without any encryption, exposing it to:

- Any JavaScript running on the same origin (XSS attacks)
- Browser extensions with broad permissions
- Physical access to the device
- Developer tools inspection

Affected services: `GDPRComplianceService`, `RateLimitStorageService`, `NotificationService`, `ErrorLoggingService`, `LiquidityRewardsService`, `WalletProvider`, `referralTracking`

## Solution Architecture

### Three-layer approach

```
Application Code
      │
      ▼
SecureStorageV2Service   ← consent checks + PII detection
      │
      ▼
EncryptionService        ← AES-256-GCM via Web Crypto API
      │
      ▼
IndexedDBService         ← persistent, structured storage
```

### Why IndexedDB over localStorage

| Feature | localStorage | IndexedDB (this impl) |
|---|---|---|
| Encryption | None | AES-256-GCM |
| Expiration | Manual | Automatic TTL |
| Capacity | ~5MB | Hundreds of MB |
| Async | No | Yes |
| Structured data | No | Yes |
| XSS exposure | High | Low |

---

## New Services

### EncryptionService (`src/services/EncryptionService.ts`)

Wraps the browser's native Web Crypto API.

- **Algorithm**: AES-256-GCM
- **Key derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Per-write randomness**: unique IV (12 bytes) and salt (16 bytes) per encryption call
- **Session key**: stored in `sessionStorage` — cleared when the tab closes

```typescript
import { EncryptionService } from './services/EncryptionService';

const encrypted = await EncryptionService.encrypt('sensitive string');
const plaintext = await EncryptionService.decrypt(encrypted);

const encryptedObj = await EncryptionService.encryptObject({ wallet: 'SP...' });
const obj = await EncryptionService.decryptObject(encryptedObj);
```

### IndexedDBService (`src/services/IndexedDBService.ts`)

Low-level IndexedDB wrapper with automatic expiration.

```typescript
import { IndexedDBService } from './services/IndexedDBService';

await IndexedDBService.initialize();
await IndexedDBService.setItem('key', value, expiresInMs);
const value = await IndexedDBService.getItem('key');
await IndexedDBService.removeItem('key');
const cleaned = await IndexedDBService.cleanupExpired();
```

### SecureStorageV2Service (`src/services/SecureStorageV2Service.ts`)

High-level API combining encryption, IndexedDB, consent checks, and PII detection. This is the primary interface for application code.

```typescript
import { SecureStorageV2Service } from './services/SecureStorageV2Service';

await SecureStorageV2Service.setItem('wallet_address', address, {
  encrypt: true,
  category: 'necessary',
  expiresIn: 365 * 24 * 60 * 60 * 1000,
  requireConsent: false,
});

const address = await SecureStorageV2Service.getItem<string>('wallet_address');
await SecureStorageV2Service.removeItem('wallet_address');
await SecureStorageV2Service.cleanupExpired();
```

**Storage categories and consent requirements:**

| Category | Consent required | Typical use |
|---|---|---|
| `necessary` | No | Wallet address, transaction history |
| `analytics` | Yes | Error logs, usage data |
| `personalization` | Yes | Preferences, filter presets |
| `marketing` | Yes | Promotional preferences |

### StorageMigrationService (`src/services/StorageMigrationService.ts`)

One-time migration from plaintext localStorage to encrypted IndexedDB. Runs automatically on first app load after the update.

```typescript
import { StorageMigrationService } from './services/StorageMigrationService';

const needed = await StorageMigrationService.isMigrationNeeded();
const result = await StorageMigrationService.migrateAll();
const status = StorageMigrationService.getMigrationStatus();
```

Migration is idempotent — safe to call multiple times. After migration, the original localStorage keys are removed.

---

## Updated Services

All affected services now write to encrypted IndexedDB while maintaining a localStorage fallback for reads during the transition period.

| Service / Utility | Storage key(s) | Category | Expiry |
|---|---|---|---|
| `GDPRComplianceService` | `gdpr_user_consent`, `gdpr_consent_history` | necessary | None |
| `RateLimitStorageService` | `rate_limit_records` | necessary | 1 hour |
| `NotificationService` | `notifications`, `notification_preferences` | necessary / personalization | 90 days |
| `ErrorLoggingService` | `error_logs` | analytics | 30 days |
| `LiquidityRewardsService` | `liquidity_positions`, `historical_rewards`, `market_volumes` | necessary | 365 days |
| `WalletProvider` | `0xcast-wallet-address` | necessary | None |
| `referralTracking` | `oxcast_referral_code`, `oxcast_tracking_id`, `referral_timestamp` | necessary | 30–90 days |
| `transactions` | `oxcast_tx_history` | necessary | 365 days |
| `stakeHistory` | `0xcast-stake-history` | necessary | 365 days |
| `networkUtils` | `network_preference` | personalization | 365 days |
| `templateStorage` | `template_cache_*`, `template_pref_*` | personalization | 24h / 90 days |
| `useFilterPresets` | `0xcast_filter_presets` | personalization | 90 days |
| `useScheduledExports` | `scheduledExports` | personalization | 365 days |

---

## Data Expiration Policies

All data stored through `SecureStorageV2Service` supports automatic expiration via the `expiresIn` option (milliseconds). Expired items are:

1. Rejected on read — `getItem` returns `null`
2. Cleaned up on app startup via `GDPRInitializer`
3. Cleaned up on a 24-hour interval

Manual cleanup:

```typescript
await SecureStorageV2Service.cleanupExpired();
```

---

## Security Properties

### XSS resistance

Encrypted data in IndexedDB is not accessible as a plain string. An attacker who can run JavaScript can still call the decryption API, but:

- The session key is in `sessionStorage` and is tab-scoped
- Each write uses a unique IV and salt — no two ciphertexts are identical even for the same plaintext
- AES-GCM provides authenticated encryption — tampered ciphertext will fail to decrypt

### Key management

The encryption key is derived per-session using PBKDF2:

```
sessionStorage._ek  →  PBKDF2(100k iterations, SHA-256)  →  AES-256-GCM key
```

The session key is a 32-byte random value generated on first use and stored in `sessionStorage`. It is cleared when the browser tab closes, which means encrypted IndexedDB data becomes inaccessible after the session ends — this is intentional for sensitive data.

For data that must survive across sessions (wallet address, transaction history), the application reads from localStorage as a fallback and re-encrypts on next write.

---

## Storage Audit

Run a security audit to detect any remaining unencrypted PII:

```typescript
import { StorageAudit } from './utils/storageAudit';

const report = await StorageAudit.run();
console.log(StorageAudit.formatReport(report));
```

The audit checks:
- localStorage keys matching sensitive patterns for unencrypted PII
- IndexedDB for expired items and unencrypted entries
- Migration completion status

---

## React Hook

```typescript
import { useSecureStorage } from './hooks/useSecureStorage';

function SettingsPage() {
  const { status, isLoading, runMigration } = useSecureStorage();

  return (
    <div>
      <p>Encrypted items: {status.encryptedItems} / {status.totalItems}</p>
      <p>Migration: {status.migrationCompleted ? 'complete' : 'pending'}</p>
      {!status.migrationCompleted && (
        <button onClick={runMigration}>Migrate Storage</button>
      )}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Wallet address is not visible in plaintext in localStorage after connect
- [ ] Consent data is stored encrypted in IndexedDB
- [ ] Rate limit records expire after 1 hour
- [ ] Error logs are only stored when analytics consent is given
- [ ] Migration runs once on first load and sets the migration flag
- [ ] Expired items are removed on app startup
- [ ] `StorageAudit.run()` reports zero critical findings after migration
- [ ] Decryption fails gracefully when session key is missing (returns null)
- [ ] `clearEncryptionKey()` prevents further decryption in the same session

---

## Browser Compatibility

The Web Crypto API (`crypto.subtle`) is available in all modern browsers:

- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

The implementation does not use any polyfills. If `crypto.subtle` is unavailable (non-HTTPS context), `EncryptionService.encrypt` will throw and `SecureStorageV2Service.setItem` will return `false`.

All production deployments must be served over HTTPS for the Web Crypto API to be available.

# Internationalization (i18n) Implementation

This document describes the internationalization implementation for the 0xCast application.

## Overview

The application uses `react-i18next` for internationalization support, providing multi-language capabilities across the entire application.

## Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)

## Features

### 1. Language Detection
- Automatically detects user's browser language
- Falls back to English if the detected language is not supported
- Stores language preference in localStorage

### 2. Language Switcher
- Located in the header navigation
- Dropdown component with flag icons
- Persists selection across sessions

### 3. Localized Formatting

#### Numbers
```typescript
import { useLocale } from '../hooks/useLocale';

const { formatNumber } = useLocale();
formatNumber(1234.56); // Formats according to current locale
```

#### Currency
```typescript
const { formatCurrency } = useLocale();
formatCurrency(100, 'USD', 2); // $100.00 (en) or 100,00 $ (fr)
```

#### Dates and Times
```typescript
const { formatDate, formatDateTime, formatTime } = useLocale();
formatDate(new Date()); // Localized date format
formatDateTime(new Date()); // Localized date and time
formatTime(new Date()); // Localized time only
```

#### Percentages
```typescript
const { formatPercentage } = useLocale();
formatPercentage(0.1234, 2); // 12.34%
```

### 4. Translation Keys

Translations are organized into namespaces:

- `common` - Shared translations (navigation, actions, status)
- `markets` - Market-specific translations
- `portfolio` - Portfolio-related translations
- `notifications` - Notification translations
- `errors` - Error messages and validation

#### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['common', 'markets']);
  
  return (
    <div>
      <h1>{t('common:app.name')}</h1>
      <button>{t('markets:actions.createMarket')}</button>
    </div>
  );
}
```

#### Translation with Variables

```typescript
t('errors:validation.minStakeRequired', { min: 10 })
// English: "Minimum amount is 10 STX"
// Spanish: "La cantidad mínima es 10 STX"
```

#### Pluralization

```typescript
t('common:time.minuteAgo', { count: 1 }) // "1 minute ago"
t('common:time.minuteAgo', { count: 5 }) // "5 minutes ago"
```

## File Structure

```
frontend/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── markets.json
│       │   ├── portfolio.json
│       │   ├── notifications.json
│       │   └── errors.json
│       ├── es/
│       ├── fr/
│       ├── de/
│       ├── zh/
│       └── ja/
├── src/
│   ├── i18n/
│   │   ├── config.ts          # i18n configuration
│   │   └── i18n.test.ts       # i18n tests
│   ├── hooks/
│   │   └── useLocale.ts       # Locale formatting hook
│   ├── components/
│   │   └── LanguageSwitcher.tsx
│   └── utils/
│       ├── i18n/
│       │   └── formatters.ts  # Intl formatters
│       └── relativeTime.ts    # Relative time formatting
```

## Adding New Translations

### 1. Add Translation Keys

Add the new keys to all language files in `public/locales/{lang}/`:

```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

### 2. Use in Components

```typescript
const { t } = useTranslation('common');
<h1>{t('myFeature.title')}</h1>
```

## Adding a New Language

1. Create a new directory in `public/locales/` with the language code
2. Copy all JSON files from `en/` directory
3. Translate all strings in the JSON files
4. Add the language to `supportedLngs` in `src/i18n/config.ts`
5. Add the language option to `LanguageSwitcher.tsx`

## Best Practices

1. Always use translation keys instead of hardcoded strings
2. Use namespaces to organize translations logically
3. Provide fallback text for development: `t('key', 'Fallback text')`
4. Use the `useLocale` hook for number, date, and currency formatting
5. Test translations in all supported languages
6. Keep translation keys descriptive and hierarchical
7. Use interpolation for dynamic content
8. Handle pluralization properly with count parameter

## Testing

Run i18n tests:
```bash
npm run test src/i18n/i18n.test.ts
```

## Components Updated

The following components have been updated to use i18n:

- Header (navigation, wallet buttons)
- MarketCard (labels, status, actions)
- LanguageSwitcher (new component)
- Validation utilities (error messages)
- Helper functions (status labels, formatting)
- Export helpers (date/currency formatting)
- Market categories (category and sort labels)

## Utilities Updated

- `helpers.ts` - Status and outcome labels
- `validation.ts` - Error messages
- `exportHelpers.ts` - Date and currency formatting
- `marketCategories.ts` - Category and sort labels
- `relativeTime.ts` - Relative time formatting

## Configuration

The i18n configuration is in `src/i18n/config.ts`:

```typescript
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    ns: ['common', 'markets', 'portfolio', 'notifications', 'errors'],
    defaultNS: 'common',
  });
```

## Browser Support

The implementation uses the Intl API for formatting, which is supported in all modern browsers. For older browsers, consider adding polyfills.

## Performance

- Translations are loaded on demand per namespace
- Language detection happens once on app initialization
- Selected language is cached in localStorage
- Translation files are served as static assets

## Accessibility

- Language switcher is keyboard accessible
- Proper ARIA labels are translated
- Screen reader announcements use translated text
- RTL languages can be supported by adding direction handling

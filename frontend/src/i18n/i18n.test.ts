import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './config';

describe('i18n Configuration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should initialize with default language', () => {
    expect(i18n.language).toBeDefined();
  });

  it('should support English translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('common:app.name')).toBe('0xCast');
    expect(i18n.t('common:nav.markets')).toBe('Markets');
  });

  it('should support Spanish translations', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('common:app.name')).toBe('0xCast');
    expect(i18n.t('common:nav.markets')).toBe('Mercados');
  });

  it('should support French translations', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('common:nav.markets')).toBe('Marchés');
  });

  it('should support German translations', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.t('common:nav.markets')).toBe('Märkte');
  });

  it('should support Chinese translations', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('common:nav.markets')).toBe('市场');
  });

  it('should support Japanese translations', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.t('common:nav.markets')).toBe('マーケット');
  });

  it('should handle missing translations with fallback', async () => {
    await i18n.changeLanguage('en');
    const result = i18n.t('common:nonexistent.key');
    expect(result).toBeDefined();
  });

  it('should interpolate variables in translations', async () => {
    await i18n.changeLanguage('en');
    const result = i18n.t('errors:validation.minStakeRequired', { min: 10 });
    expect(result).toContain('10');
  });

  it('should handle pluralization', async () => {
    await i18n.changeLanguage('en');
    const singular = i18n.t('common:time.minuteAgo', { count: 1 });
    const plural = i18n.t('common:time.minuteAgo', { count: 5 });
    expect(singular).toContain('minute');
    expect(plural).toContain('minutes');
  });

  it('should change language dynamically', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('common:wallet.connect')).toBe('Connect Wallet');
    
    await i18n.changeLanguage('es');
    expect(i18n.t('common:wallet.connect')).toBe('Conectar Billetera');
  });

  it('should load market translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('markets:categories.crypto')).toBe('Crypto');
    expect(i18n.t('markets:actions.createMarket')).toBe('Create Market');
  });

  it('should load portfolio translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('portfolio:title')).toBe('Portfolio');
    expect(i18n.t('portfolio:overview.totalValue')).toBe('Total Value');
  });

  it('should load notification translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('notifications:title')).toBe('Notifications');
    expect(i18n.t('notifications:types.priceMovement')).toBe('Price Movement');
  });

  it('should load error translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('errors:validation.required')).toBe('This field is required');
    expect(i18n.t('errors:wallet.notConnected')).toBe('Wallet not connected');
  });
});

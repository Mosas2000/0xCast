import type { TemplateCategory } from '../types/template';
import { GDPRComplianceService } from '../services/GDPRComplianceService';

export class TemplateCache {
  private static cache: Map<string, any> = new Map();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    try {
      const stored = localStorage.getItem('template_cache_version');
      if (stored !== CACHE_VERSION) {
        this.clear();
        localStorage.setItem('template_cache_version', CACHE_VERSION);
      }
    } catch (e) {
      console.warn('Template cache initialization failed:', e);
    }

    this.initialized = true;
  }

  static set(key: string, value: any, ttlMs: number = 24 * 60 * 60 * 1000): void {
    try {
      const consentCheck = GDPRComplianceService.checkConsentForStorage(
        { key, value },
        'personalization'
      );

      if (!consentCheck.allowed) {
        console.warn('Template cache storage blocked:', consentCheck.reason);
        return;
      }

      const entry = {
        value,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      this.cache.set(key, entry);
      localStorage.setItem(`template_cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn(`Failed to cache ${key}:`, e);
    }
  }

  static get(key: string): any {
    try {
      let entry = this.cache.get(key);

      if (!entry) {
        const stored = localStorage.getItem(`template_cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          this.cache.set(key, entry);
        }
      }

      if (!entry) return null;

      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.value;
    } catch (e) {
      console.warn(`Failed to retrieve cache ${key}:`, e);
      return null;
    }
  }

  static delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`template_cache_${key}`);
    } catch (e) {
      console.warn(`Failed to delete cache ${key}:`, e);
    }
  }

  static clear(): void {
    this.cache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('template_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }

  static has(key: string): boolean {
    return this.cache.has(key) || !!this.get(key);
  }
}

const CACHE_VERSION = '1.0.0';

export class TemplatePreferences {
  static saveUserPreference(key: string, value: any): void {
    try {
      const consentCheck = GDPRComplianceService.checkConsentForStorage(
        { key, value },
        'personalization'
      );

      if (!consentCheck.allowed) {
        console.warn('Template preference storage blocked:', consentCheck.reason);
        return;
      }

      localStorage.setItem(`template_pref_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save preference:', e);
    }
  }

  static getUserPreference(key: string, defaultValue: any = null): any {
    try {
      const stored = localStorage.getItem(`template_pref_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.warn('Failed to retrieve preference:', e);
      return defaultValue;
    }
  }

  static getLastUsedTemplate(): TemplateCategory | null {
    return this.getUserPreference('lastTemplate', null);
  }

  static setLastUsedTemplate(templateId: TemplateCategory): void {
    this.saveUserPreference('lastTemplate', templateId);
  }

  static getLastUsedDuration(): number {
    return this.getUserPreference('lastDuration', 1008);
  }

  static setLastUsedDuration(duration: number): void {
    this.saveUserPreference('lastDuration', duration);
  }

  static getLastUsedCategory(): string {
    return this.getUserPreference('lastCategory', 'other');
  }

  static setLastUsedCategory(category: string): void {
    this.saveUserPreference('lastCategory', category);
  }

  static getFormDraft(): any {
    return this.getUserPreference('formDraft', null);
  }

  static saveFormDraft(data: {
    question: string;
    duration: number;
    category: string;
    templateId: TemplateCategory | null;
  }): void {
    this.saveUserPreference('formDraft', {
      ...data,
      savedAt: Date.now(),
    });
  }

  static clearFormDraft(): void {
    try {
      localStorage.removeItem('template_pref_formDraft');
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
  }

  static getCompletionCount(): number {
    return this.getUserPreference('completionCount', 0);
  }

  static incrementCompletionCount(): void {
    const count = this.getCompletionCount();
    this.saveUserPreference('completionCount', count + 1);
  }
}

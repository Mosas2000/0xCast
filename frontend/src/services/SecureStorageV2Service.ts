import { EncryptionService, type EncryptedData } from './EncryptionService';
import { IndexedDBService } from './IndexedDBService';
import { GDPRComplianceService } from './GDPRComplianceService';
import { PIIDetectionService } from './PIIDetectionService';
import type { JsonValue } from '@/types/common';

export interface SecureStorageOptions {
  encrypt?: boolean;
  expiresIn?: number;
  category?: 'necessary' | 'analytics' | 'marketing' | 'personalization';
  requireConsent?: boolean;
}

export interface StorageMetadata {
  encrypted: boolean;
  category: string;
  hasPII: boolean;
  createdAt: number;
  expiresAt?: number;
}

export class SecureStorageV2Service {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await IndexedDBService.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      throw error;
    }
  }

  static async setItem(
    key: string,
    value: JsonValue,
    options: SecureStorageOptions = {}
  ): Promise<boolean> {
    try {
      await this.initialize();

      const {
        encrypt = true,
        expiresIn,
        category = 'necessary',
        requireConsent = true,
      } = options;

      const detection = PIIDetectionService.detectPII(
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? (value as Record<string, string | number | boolean | null | undefined>)
          : { value: String(value) }
      );

      if (detection.requiresConsent && requireConsent) {
        const consentCheck = GDPRComplianceService.checkConsentForStorage(
          { [key]: value },
          category
        );

        if (!consentCheck.allowed) {
          console.warn(`Storage blocked for ${key}: ${consentCheck.reason}`);
          return false;
        }
      }

      const metadata: StorageMetadata = {
        encrypted: encrypt,
        category,
        hasPII: detection.hasPII,
        createdAt: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };

      let dataToStore: JsonValue;

      if (encrypt) {
        const encrypted = await EncryptionService.encryptObject({
          value,
          metadata,
        });
        dataToStore = encrypted;
      } else {
        dataToStore = { value, metadata };
      }

      await IndexedDBService.setItem(key, dataToStore, expiresIn);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      await this.initialize();

      const stored = await IndexedDBService.getItem(key);
      if (!stored) return null;

      if (this.isEncryptedData(stored)) {
        const decrypted = await EncryptionService.decryptObject<{
          value: T;
          metadata: StorageMetadata;
        }>(stored);

        if (decrypted.metadata.expiresAt && Date.now() > decrypted.metadata.expiresAt) {
          await this.removeItem(key);
          return null;
        }

        return decrypted.value;
      }

      if (stored.metadata?.expiresAt && Date.now() > stored.metadata.expiresAt) {
        await this.removeItem(key);
        return null;
      }

      return stored.value;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      await this.initialize();
      await IndexedDBService.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  static async clear(category?: string): Promise<void> {
    try {
      await this.initialize();

      if (!category) {
        await IndexedDBService.clear();
        return;
      }

      const keys = await IndexedDBService.getAllKeys();
      for (const key of keys) {
        const item = await this.getItemWithMetadata(key);
        if (item?.metadata.category === category) {
          await this.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  static async cleanupExpired(): Promise<number> {
    try {
      await this.initialize();
      return await IndexedDBService.cleanupExpired();
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
      return 0;
    }
  }

  static async getAllPIIData(): Promise<Array<{ key: string; metadata: StorageMetadata }>> {
    try {
      await this.initialize();

      const result: Array<{ key: string; metadata: StorageMetadata }> = [];
      const keys = await IndexedDBService.getAllKeys();

      for (const key of keys) {
        const item = await this.getItemWithMetadata(key);
        if (item?.metadata.hasPII) {
          result.push({ key, metadata: item.metadata });
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to get PII data:', error);
      return [];
    }
  }

  static async deleteAllPIIData(): Promise<boolean> {
    try {
      const piiData = await this.getAllPIIData();
      for (const { key } of piiData) {
        await this.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete PII data:', error);
      return false;
    }
  }

  static async getStorageReport(): Promise<{
    totalItems: number;
    encryptedItems: number;
    piiItems: number;
    expiredItems: number;
    categoryCounts: Record<string, number>;
  }> {
    try {
      await this.initialize();

      const stats = await IndexedDBService.getStorageStats();
      const keys = await IndexedDBService.getAllKeys();

      let piiItems = 0;
      const categoryCounts: Record<string, number> = {};

      for (const key of keys) {
        const item = await this.getItemWithMetadata(key);
        if (item) {
          if (item.metadata.hasPII) piiItems++;
          categoryCounts[item.metadata.category] =
            (categoryCounts[item.metadata.category] || 0) + 1;
        }
      }

      return {
        totalItems: stats.totalItems,
        encryptedItems: stats.encryptedItems,
        piiItems,
        expiredItems: stats.expiredItems,
        categoryCounts,
      };
    } catch (error) {
      console.error('Failed to generate storage report:', error);
      return {
        totalItems: 0,
        encryptedItems: 0,
        piiItems: 0,
        expiredItems: 0,
        categoryCounts: {},
      };
    }
  }

  private static async getItemWithMetadata(
    key: string
  ): Promise<{ value: JsonValue; metadata: StorageMetadata } | null> {
    try {
      const stored = await IndexedDBService.getItem(key);
      if (!stored) return null;

      if (this.isEncryptedData(stored)) {
        return await EncryptionService.decryptObject(stored);
      }

      return stored;
    } catch (error) {
      console.error(`Failed to get item with metadata for ${key}:`, error);
      return null;
    }
  }

  private static isEncryptedData(value: unknown): value is EncryptedData {
    return (
      typeof value === 'object' &&
      value !== null &&
      'ciphertext' in value &&
      'iv' in value &&
      'salt' in value
    );
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}

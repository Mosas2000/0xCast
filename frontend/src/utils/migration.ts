import { SyncEntity } from '@/types/sync';
import { DataMigrationService } from '@/utils/syncUtils';

/**
 * Migration utilities for integrating existing data into sync system
 */

export interface MigrationConfig {
  batchSize: number;
  onProgress?: (current: number, total: number) => void;
  validateData?: boolean;
  dropOnError?: boolean;
}

export class DataMigrator {
  /**
   * Migrate data from legacy storage to sync system
   */
  static async migrateFromLegacyStorage<T extends Record<string, any>>(
    legacyStorage: Record<string, T>,
    entityType: string,
    config: MigrationConfig = { batchSize: 100 }
  ): Promise<{
    success: boolean;
    migrated: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      const entries = Object.entries(legacyStorage);
      const batches = DataMigrationService.batchMigrationEntities(
        entries.map(([id, data]) =>
          DataMigrationService.prepareForMigration(data, entityType, id)
        ),
        config.batchSize
      );

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        if (config.validateData) {
          const validation = DataMigrationService.validateMigrationData(batch);
          if (!validation.valid) {
            if (config.dropOnError) {
              result.failed += batch.length;
              result.errors.push(...validation.errors);
              continue;
            }
          }
        }

        result.migrated += batch.length;

        if (config.onProgress) {
          const current = Math.min(
            (batchIndex + 1) * config.batchSize,
            entries.length
          );
          config.onProgress(current, entries.length);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Migration error: ${error}`);
    }

    return result;
  }

  /**
   * Migrate from localStorage to sync system
   */
  static async migrateFromLocalStorage(
    prefix: string,
    entityType: string,
    config: MigrationConfig = { batchSize: 100 }
  ): Promise<SyncEntity[]> {
    const entities: SyncEntity[] = [];

    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(prefix)
      );

      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (!item) continue;

        try {
          const data = JSON.parse(item);
          const entityId = key.replace(prefix, '');

          const entity = DataMigrationService.prepareForMigration(
            data,
            entityType,
            entityId
          );
          entities.push(entity);
        } catch (e) {
          if (!config.dropOnError) {
            throw e;
          }
        }
      }

      if (config.onProgress) {
        config.onProgress(entities.length, entities.length);
      }
    } catch (error) {
      console.error('LocalStorage migration error:', error);
      if (!config.dropOnError) throw error;
    }

    return entities;
  }

  /**
   * Generate migration script for batch data import
   */
  static generateMigrationScript(
    entities: SyncEntity[],
    targetService: string = 'stateManager'
  ): string {
    const script = `
// Generated migration script
// Execute in browser console or Node.js with appropriate context

async function migrate() {
  const entities = ${JSON.stringify(entities, null, 2)};
  
  for (const entity of entities) {
    await ${targetService}.addEntity(entity);
  }
  
  console.log('Migration complete:', entities.length, 'entities imported');
}

migrate().catch(console.error);
`;
    return script;
  }

  /**
   * Validate migration data completeness
   */
  static validateMigrationCompleteness(
    sourceCount: number,
    targetEntities: SyncEntity[],
    errorThreshold: number = 0.05
  ): {
    valid: boolean;
    sourceCount: number;
    targetCount: number;
    errorRate: number;
    message: string;
  } {
    const targetCount = targetEntities.length;
    const errorRate = (sourceCount - targetCount) / sourceCount;
    const valid = errorRate <= errorThreshold;

    return {
      valid,
      sourceCount,
      targetCount,
      errorRate,
      message: valid
        ? `Migration successful: ${targetCount}/${sourceCount} entities`
        : `Migration incomplete: ${targetCount}/${sourceCount} entities (error rate: ${(errorRate * 100).toFixed(2)}%)`,
    };
  }
}

/**
 * Data format conversion utilities
 */
export class DataFormatConverter {
  /**
   * Convert CSV to sync entities
   */
  static csvToEntities(
    csvContent: string,
    entityType: string,
    idColumn: string = 'id'
  ): SyncEntity[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const entities: SyncEntity[] = [];

    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) {
      throw new Error(`ID column "${idColumn}" not found in CSV`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const data: Record<string, any> = {};

      headers.forEach((header, index) => {
        data[header] = values[index];
      });

      const entityId = values[idIndex];
      const entity = DataMigrationService.prepareForMigration(
        data,
        entityType,
        entityId
      );
      entities.push(entity);
    }

    return entities;
  }

  /**
   * Convert JSON to sync entities
   */
  static jsonToEntities(
    jsonData: any[],
    entityType: string,
    idField: string = 'id'
  ): SyncEntity[] {
    return jsonData.map((item) => {
      const entityId = item[idField];
      if (!entityId) {
        throw new Error(`ID field "${idField}" not found in JSON item`);
      }
      return DataMigrationService.prepareForMigration(item, entityType, entityId);
    });
  }

  /**
   * Convert XML to sync entities (simplified)
   */
  static xmlToEntities(
    xmlContent: string,
    entityType: string,
    elementName: string = 'item'
  ): SyncEntity[] {
    const entities: SyncEntity[] = [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    if (doc.parseError) {
      throw new Error('Invalid XML: ' + doc.parseError);
    }

    const elements = doc.getElementsByTagName(elementName);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const data: Record<string, any> = {};
      let entityId = '';

      for (let j = 0; j < element.children.length; j++) {
        const child = element.children[j];
        const key = child.tagName;
        const value = child.textContent || '';

        data[key] = value;

        if (key === 'id') {
          entityId = value;
        }
      }

      if (entityId) {
        const entity = DataMigrationService.prepareForMigration(
          data,
          entityType,
          entityId
        );
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Export sync entities to JSON
   */
  static entitiesToJson(
    entities: SyncEntity[],
    pretty: boolean = true
  ): string {
    return JSON.stringify(entities, null, pretty ? 2 : undefined);
  }

  /**
   * Export sync entities to CSV
   */
  static entitiesToCsv(entities: SyncEntity[]): string {
    if (entities.length === 0) {
      return '';
    }

    const allKeys = new Set<string>();
    entities.forEach((e) => {
      Object.keys(e.data).forEach((k) => allKeys.add(k));
    });

    const headers = [
      'id',
      'type',
      'localVersion',
      'remoteVersion',
      'isSynced',
      ...Array.from(allKeys),
    ];

    const rows: string[] = [];
    rows.push(headers.join(','));

    entities.forEach((entity) => {
      const values = [
        entity.id,
        entity.type,
        entity.localVersion,
        entity.remoteVersion,
        entity.isSynced,
        ...headers.slice(5).map((key) => {
          const value = entity.data[key];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value ?? '';
        }),
      ];
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }
}

/**
 * Backup and restore utilities
 */
export class SyncBackupRestore {
  /**
   * Create backup of sync state
   */
  static createBackup(
    entities: SyncEntity[],
    metadata: Record<string, any> = {}
  ): string {
    const backup = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      metadata,
      entities,
      entityCount: entities.length,
      totalSize: JSON.stringify(entities).length,
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restore from backup
   */
  static restoreFromBackup(backupJson: string): {
    entities: SyncEntity[];
    metadata: Record<string, any>;
    createdAt: string;
  } {
    try {
      const backup = JSON.parse(backupJson);

      if (!backup.version || !backup.entities) {
        throw new Error('Invalid backup format');
      }

      return {
        entities: backup.entities,
        metadata: backup.metadata || {},
        createdAt: backup.createdAt,
      };
    } catch (error) {
      throw new Error(`Backup restore error: ${error}`);
    }
  }

  /**
   * Download backup as file
   */
  static downloadBackup(backupJson: string, filename?: string): void {
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename || `sync-backup-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Create incremental backup
   */
  static createIncrementalBackup(
    currentEntities: SyncEntity[],
    previousBackup: SyncEntity[]
  ): SyncEntity[] {
    const previousIds = new Set(previousBackup.map((e) => e.id));

    return currentEntities.filter((entity) => {
      if (!previousIds.has(entity.id)) {
        return true;
      }

      const previous = previousBackup.find((e) => e.id === entity.id);
      if (!previous) return true;

      return (
        JSON.stringify(entity.data) !== JSON.stringify(previous.data) ||
        entity.localVersion !== previous.localVersion
      );
    });
  }
}

import type { SyncConflict, ConflictResolution, SyncDiff } from '@/types/sync';
import type { UnknownRecord, RecordValue } from '@/types/common';

export class ConflictResolutionService {
  private resolvedConflicts: Map<string, SyncConflict> = new Map();

  detectConflict(
    localData: UnknownRecord,
    remoteData: UnknownRecord,
    localVersion: number,
    remoteVersion: number
  ): boolean {
    if (localVersion === remoteVersion) {
      return false;
    }

    const localHash = this.hashData(localData);
    const remoteHash = this.hashData(remoteData);

    return localHash !== remoteHash;
  }

  calculateDiff(
    localData: UnknownRecord,
    remoteData: UnknownRecord
  ): SyncDiff {
    const diff: SyncDiff = {
      fields: {},
      added: [],
      removed: [],
    };

    const allKeys = new Set([
      ...Object.keys(localData),
      ...Object.keys(remoteData),
    ]);

    allKeys.forEach(key => {
      if (!(key in remoteData)) {
        diff.removed.push(key);
      } else if (!(key in localData)) {
        diff.added.push(key);
      } else if (localData[key] !== remoteData[key]) {
        diff.fields[key] = {
          local: localData[key],
          remote: remoteData[key],
        };
      }
    });

    return diff;
  }

  resolveConflict(
    conflict: SyncConflict,
    strategy: ConflictResolution
  ): UnknownRecord {
    switch (strategy) {
      case 'local':
        return this.resolveWithLocal(conflict);
      case 'remote':
        return this.resolveWithRemote(conflict);
      case 'merge':
        return this.resolveMerge(conflict);
      case 'manual':
        throw new Error('Manual resolution required');
      default:
        return this.resolveMerge(conflict);
    }
  }

  private resolveWithLocal(conflict: SyncConflict): UnknownRecord {
    return conflict.localData;
  }

  private resolveWithRemote(conflict: SyncConflict): UnknownRecord {
    return conflict.remoteData;
  }

  private resolveMerge(conflict: SyncConflict): UnknownRecord {
    const diff = this.calculateDiff(conflict.localData, conflict.remoteData);
    const merged = { ...conflict.remoteData };

    Object.keys(conflict.localData).forEach(key => {
      if (diff.removed.includes(key)) {
        delete merged[key];
      } else if (diff.added.includes(key)) {
        merged[key] = conflict.localData[key];
      } else if (diff.fields[key]) {
        merged[key] = this.mergeField(
          diff.fields[key].local,
          diff.fields[key].remote
        );
      }
    });

    return merged;
  }

  private mergeField(local: RecordValue, remote: RecordValue): RecordValue {
    if (typeof local === 'object' && typeof remote === 'object' && local !== null && remote !== null) {
      if (Array.isArray(local) && Array.isArray(remote)) {
        return this.mergeArrays(local, remote);
      }
      return this.mergeObjects(local as UnknownRecord, remote as UnknownRecord);
    }

    const localModified = this.getModificationTime(local);
    const remoteModified = this.getModificationTime(remote);

    return localModified > remoteModified ? local : remote;
  }

  private mergeArrays(local: RecordValue[], remote: RecordValue[]): RecordValue[] {
    const merged = [...remote];
    const remoteIds = new Set(remote.map((item: RecordValue) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return (item as UnknownRecord).id || item;
      }
      return item;
    }));

    local.forEach(item => {
      const id = typeof item === 'object' && item !== null && !Array.isArray(item)
        ? (item as UnknownRecord).id || item
        : item;
      if (!remoteIds.has(id)) {
        merged.push(item);
      }
    });

    return merged;
  }

  private mergeObjects(local: UnknownRecord, remote: UnknownRecord): UnknownRecord {
    const merged = { ...remote };

    Object.entries(local).forEach(([key, value]) => {
      if (!(key in merged)) {
        merged[key] = value;
      }
    });

    return merged;
  }

  private getModificationTime(value: RecordValue): number {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const obj = value as UnknownRecord;
      if (typeof obj.lastModified === 'number') {
        return obj.lastModified;
      }
    }
    return 0;
  }

  hashData(data: UnknownRecord): string {
    const json = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return hash.toString(16);
  }

  validateResolution(
    conflict: SyncConflict,
    resolvedData: UnknownRecord
  ): boolean {
    if (!resolvedData || typeof resolvedData !== 'object') {
      return false;
    }

    const requiredFields = Object.keys(conflict.localData).filter(
      key => conflict.localData[key] !== null && conflict.localData[key] !== undefined
    );

    return requiredFields.every(field => field in resolvedData);
  }

  storeResolvedConflict(conflict: SyncConflict): void {
    this.resolvedConflicts.set(conflict.id, conflict);
  }

  getResolvedConflict(id: string): SyncConflict | undefined {
    return this.resolvedConflicts.get(id);
  }

  getAllResolvedConflicts(): SyncConflict[] {
    return Array.from(this.resolvedConflicts.values());
  }

  clearResolvedConflict(id: string): void {
    this.resolvedConflicts.delete(id);
  }

  hasConflict(entityId: string, entityType: string): boolean {
    return Array.from(this.resolvedConflicts.values()).some(
      conflict =>
        conflict.entityId === entityId && conflict.entityType === entityType
    );
  }
}

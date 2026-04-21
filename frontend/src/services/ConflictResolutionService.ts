import { SyncConflict, ConflictResolution, SyncDiff } from '@/types/sync';

export class ConflictResolutionService {
  private resolvedConflicts: Map<string, SyncConflict> = new Map();

  detectConflict(
    localData: Record<string, any>,
    remoteData: Record<string, any>,
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
    localData: Record<string, any>,
    remoteData: Record<string, any>
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
  ): Record<string, any> {
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

  private resolveWithLocal(conflict: SyncConflict): Record<string, any> {
    return conflict.localData;
  }

  private resolveWithRemote(conflict: SyncConflict): Record<string, any> {
    return conflict.remoteData;
  }

  private resolveMerge(conflict: SyncConflict): Record<string, any> {
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

  private mergeField(local: any, remote: any): any {
    if (typeof local === 'object' && typeof remote === 'object') {
      if (Array.isArray(local) && Array.isArray(remote)) {
        return this.mergeArrays(local, remote);
      }
      return this.mergeObjects(local, remote);
    }

    const localModified = this.getModificationTime(local);
    const remoteModified = this.getModificationTime(remote);

    return localModified > remoteModified ? local : remote;
  }

  private mergeArrays(local: any[], remote: any[]): any[] {
    const merged = [...remote];
    const remoteIds = new Set(remote.map((item: any) => item.id || item));

    local.forEach(item => {
      const id = item.id || item;
      if (!remoteIds.has(id)) {
        merged.push(item);
      }
    });

    return merged;
  }

  private mergeObjects(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
    const merged = { ...remote };

    Object.entries(local).forEach(([key, value]) => {
      if (!(key in merged)) {
        merged[key] = value;
      }
    });

    return merged;
  }

  private getModificationTime(value: any): number {
    if (typeof value === 'object' && value?.lastModified) {
      return value.lastModified;
    }
    return 0;
  }

  hashData(data: Record<string, any>): string {
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
    resolvedData: Record<string, any>
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

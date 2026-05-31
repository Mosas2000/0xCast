import { BatchRequest } from '@/types/batch';

export class BatchMigration {
  static migrateToNewVersion(oldBatches: any[]): BatchRequest[] {
    return oldBatches.map(batch => ({
      id: batch.id || `batch_${Date.now()}`,
      transactions: batch.txs || [],
      status: batch.state || 'pending',
      createdAt: batch.createdTime || Date.now(),
    }));
  }

  static isLegacyFormat(batch: any): boolean {
    return batch.txs !== undefined || batch.state !== undefined;
  }
}

export class BatchValidationRules {
  static validateBatchRules(batch: BatchRequest): boolean {
    return batch.transactions.length > 0 && batch.transactions.length <= 50;
  }
}

export class BatchFactory {
  static createEmpty(): BatchRequest {
    return {
      id: `batch_${Date.now()}`,
      transactions: [],
      status: 'pending',
      createdAt: Date.now(),
    };
  }

  static createFromTemplate(template: Partial<BatchRequest>): BatchRequest {
    return {
      id: template.id || `batch_${Date.now()}`,
      transactions: template.transactions || [],
      status: template.status || 'pending',
      createdAt: template.createdAt || Date.now(),
    };
  }
}

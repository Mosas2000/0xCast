import { BatchRequest } from '@/types/batch';

export class BatchDataValidator {
  static validateBatchRequest(batch: BatchRequest): Array<{ field: string; error: string }> {
    const errors: Array<{ field: string; error: string }> = [];

    if (!batch.id || batch.id.length === 0) {
      errors.push({ field: 'id', error: 'Batch ID is required' });
    }

    if (!batch.transactions || batch.transactions.length === 0) {
      errors.push({ field: 'transactions', error: 'At least one transaction is required' });
    }

    if (batch.transactions.length > 50) {
      errors.push({
        field: 'transactions',
        error: 'Cannot exceed 50 transactions per batch',
      });
    }

    for (let i = 0; i < batch.transactions.length; i++) {
      const tx = batch.transactions[i];

      if (!tx.id) {
        errors.push({ field: `transactions[${i}].id`, error: 'Transaction ID is required' });
      }

      if (!tx.type) {
        errors.push({ field: `transactions[${i}].type`, error: 'Transaction type is required' });
      }

      if (!tx.functionName) {
        errors.push({
          field: `transactions[${i}].functionName`,
          error: 'Function name is required',
        });
      }

      if (!Array.isArray(tx.functionArgs)) {
        errors.push({
          field: `transactions[${i}].functionArgs`,
          error: 'Function arguments must be an array',
        });
      }

      const amount = parseFloat(tx.amount);
      if (isNaN(amount) || amount < 0) {
        errors.push({
          field: `transactions[${i}].amount`,
          error: 'Amount must be a valid non-negative number',
        });
      }
    }

    if (!batch.status) {
      errors.push({ field: 'status', error: 'Status is required' });
    }

    const validStatuses = ['pending', 'queued', 'processing', 'submitted', 'confirmed', 'failed', 'rolled_back'];
    if (!validStatuses.includes(batch.status)) {
      errors.push({ field: 'status', error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    return errors;
  }

  static validateTransactionAmount(amount: string): boolean {
    try {
      const value = parseFloat(amount);
      return !isNaN(value) && value >= 0;
    } catch {
      return false;
    }
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

export class BatchSecurityManager {
  static validateBatchOwner(batchCreator: string, currentUser: string): boolean {
    return batchCreator === currentUser;
  }

  static encryptBatchData(data: string): string {
    return btoa(data);
  }

  static decryptBatchData(encrypted: string): string {
    try {
      return atob(encrypted);
    } catch {
      return '';
    }
  }

  static generateBatchChecksum(batch: BatchRequest): string {
    const data = JSON.stringify({
      id: batch.id,
      transactions: batch.transactions.map(t => ({
        id: t.id,
        type: t.type,
        functionName: t.functionName,
      })),
    });

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  static verifyBatchIntegrity(batch: BatchRequest, checksum: string): boolean {
    const calculated = this.generateBatchChecksum(batch);
    return calculated === checksum;
  }
}

export class BatchAccessControl {
  private static permissions: Map<string, string[]> = new Map();

  static grantPermission(userId: string, permission: string): void {
    if (!this.permissions.has(userId)) {
      this.permissions.set(userId, []);
    }
    const perms = this.permissions.get(userId)!;
    if (!perms.includes(permission)) {
      perms.push(permission);
    }
  }

  static hasPermission(userId: string, permission: string): boolean {
    const perms = this.permissions.get(userId);
    return perms ? perms.includes(permission) : false;
  }

  static revokePermission(userId: string, permission: string): void {
    const perms = this.permissions.get(userId);
    if (perms) {
      const index = perms.indexOf(permission);
      if (index !== -1) {
        perms.splice(index, 1);
      }
    }
  }

  static canCreateBatch(userId: string): boolean {
    return this.hasPermission(userId, 'batch:create');
  }

  static canExecuteBatch(userId: string): boolean {
    return this.hasPermission(userId, 'batch:execute');
  }

  static canRollbackBatch(userId: string): boolean {
    return this.hasPermission(userId, 'batch:rollback');
  }

  static canViewAnalytics(userId: string): boolean {
    return this.hasPermission(userId, 'batch:analytics');
  }
}

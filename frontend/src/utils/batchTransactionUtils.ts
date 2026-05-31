import { BatchTransaction, BatchRequest, BatchStatus } from '@/types/batch';

export class BatchTransactionBuilder {
  private transactions: BatchTransaction[] = [];
  private batchId: string;

  constructor(batchId?: string) {
    this.batchId = batchId || this.generateBatchId();
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addStakeTransaction(amount: string, functionArgs: unknown[]): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: 'stake',
      amount,
      functionName: 'stake',
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  addUnstakeTransaction(amount: string, functionArgs: unknown[]): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: 'unstake',
      amount,
      functionName: 'unstake',
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  addClaimTransaction(marketId: number, functionArgs: unknown[]): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: 'claim',
      marketId,
      amount: '0',
      functionName: 'claim-winnings',
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  addTradeTransaction(
    marketId: number,
    amount: string,
    functionArgs: unknown[],
    tradeType: 'buy' | 'sell' = 'buy'
  ): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: 'trade',
      marketId,
      amount,
      functionName: tradeType === 'buy' ? 'predict-yes' : 'predict-no',
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  addTransferTransaction(amount: string, functionArgs: unknown[]): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: 'transfer',
      amount,
      functionName: 'transfer',
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  addCustomTransaction(
    type: string,
    functionName: string,
    amount: string,
    functionArgs: unknown[]
  ): this {
    this.transactions.push({
      id: `tx_${this.transactions.length}`,
      type: type as any,
      amount,
      functionName,
      functionArgs,
      timestamp: Date.now(),
    });
    return this;
  }

  setBatchId(id: string): this {
    this.batchId = id;
    return this;
  }

  getTransactionCount(): number {
    return this.transactions.length;
  }

  getTransactions(): BatchTransaction[] {
    return [...this.transactions];
  }

  clear(): this {
    this.transactions = [];
    return this;
  }

  build(): BatchRequest {
    if (this.transactions.length === 0) {
      throw new Error('Cannot build batch with no transactions');
    }

    return {
      id: this.batchId,
      transactions: [...this.transactions],
      status: 'pending',
      createdAt: Date.now(),
    };
  }

  isEmpty(): boolean {
    return this.transactions.length === 0;
  }

  canAdd(transaction: BatchTransaction): boolean {
    return this.transactions.length < 50;
  }
}

export class BatchRequestManager {
  static isValidBatchRequest(batch: BatchRequest): boolean {
    if (!batch.id || !batch.transactions || batch.transactions.length === 0) {
      return false;
    }
    
    if (!this.isValidStatus(batch.status)) {
      return false;
    }

    return batch.transactions.every(tx => this.isValidTransaction(tx));
  }

  static isValidTransaction(tx: BatchTransaction): boolean {
    return !!(
      tx.id &&
      tx.type &&
      tx.functionName &&
      tx.functionArgs &&
      Array.isArray(tx.functionArgs)
    );
  }

  static isValidStatus(status: BatchStatus): boolean {
    const validStatuses = [
      'pending',
      'queued',
      'processing',
      'submitted',
      'confirmed',
      'failed',
      'rolled_back',
    ];
    return validStatuses.includes(status);
  }

  static updateBatchStatus(batch: BatchRequest, newStatus: BatchStatus): BatchRequest {
    return {
      ...batch,
      status: newStatus,
      ...(newStatus === 'submitted' && { submittedAt: Date.now() }),
      ...(newStatus === 'confirmed' && { completedAt: Date.now() }),
      ...(newStatus === 'failed' && { completedAt: Date.now() }),
    };
  }

  static isBatchProcessingComplete(batch: BatchRequest): boolean {
    return ['confirmed', 'failed', 'rolled_back'].includes(batch.status);
  }

  static canRetryBatch(batch: BatchRequest): boolean {
    return ['failed', 'rolled_back'].includes(batch.status);
  }
}

export class BatchValidator {
  static validateTransactionTypes(batch: BatchRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validTypes = ['stake', 'unstake', 'claim', 'trade', 'transfer', 'approve'];

    for (const tx of batch.transactions) {
      if (!validTypes.includes(tx.type)) {
        errors.push(`Invalid transaction type: ${tx.type}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateBatchSize(batch: BatchRequest): { valid: boolean; message: string } {
    if (batch.transactions.length === 0) {
      return { valid: false, message: 'Batch must contain at least 1 transaction' };
    }

    if (batch.transactions.length > 50) {
      return { valid: false, message: 'Batch cannot contain more than 50 transactions' };
    }

    return { valid: true, message: '' };
  }

  static validateTransactionAmounts(batch: BatchRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const tx of batch.transactions) {
      const amount = parseFloat(tx.amount);
      if (isNaN(amount) || amount < 0) {
        errors.push(`Invalid amount in transaction ${tx.id}: ${tx.amount}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateBatch(batch: BatchRequest): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    const sizeCheck = this.validateBatchSize(batch);
    if (!sizeCheck.valid) {
      allErrors.push(sizeCheck.message);
    }

    const typesCheck = this.validateTransactionTypes(batch);
    if (!typesCheck.valid) {
      allErrors.push(...typesCheck.errors);
    }

    const amountsCheck = this.validateTransactionAmounts(batch);
    if (!amountsCheck.valid) {
      allErrors.push(...amountsCheck.errors);
    }

    return { valid: allErrors.length === 0, errors: allErrors };
  }
}

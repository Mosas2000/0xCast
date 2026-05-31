import { BatchRequest } from '@/types/batch';

export class BatchDiagnostics {
  static diagnoseIssues(batch: BatchRequest): { issue: string; severity: 'low' | 'medium' | 'high' }[] {
    const issues = [];

    if (batch.transactions.length === 0) {
      issues.push({ issue: 'Empty batch', severity: 'high' });
    }

    if (batch.transactions.length > 50) {
      issues.push({ issue: 'Batch exceeds size limit', severity: 'high' });
    }

    for (const tx of batch.transactions) {
      const amount = parseFloat(tx.amount);
      if (isNaN(amount)) {
        issues.push({ issue: `Invalid amount in transaction ${tx.id}`, severity: 'high' });
      }
    }

    return issues;
  }

  static generateDiagnosticReport(batch: BatchRequest): string {
    const issues = this.diagnoseIssues(batch);
    return `Batch ${batch.id}: ${issues.length} issues found`;
  }
}

export class BatchHealthCheck {
  static runHealthCheck(batch: BatchRequest): boolean {
    if (!batch || !batch.id) return false;
    if (!batch.transactions || batch.transactions.length === 0) return false;
    return true;
  }

  static getHealth(batch: BatchRequest): { healthy: boolean; score: number } {
    const maxScore = 100;
    let score = maxScore;

    if (!batch.id) score -= 20;
    if (!batch.transactions) score -= 30;
    if (batch.transactions.length > 40) score -= 10;

    return { healthy: score > 50, score: Math.max(0, score) };
  }
}

export class BatchDebugger {
  static debugBatch(batch: BatchRequest): string {
    return `
    Batch Debug Info:
    ID: ${batch.id}
    Status: ${batch.status}
    Transactions: ${batch.transactions.length}
    Created: ${new Date(batch.createdAt).toISOString()}
    `;
  }

  static traceExecution(batch: BatchRequest): void {
    console.log('Batch execution trace:', {
      id: batch.id,
      txCount: batch.transactions.length,
      timestamp: Date.now(),
    });
  }
}

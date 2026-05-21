import type { ExportTransaction, ExportPosition, ExportPortfolio, ExportReward } from '../types/export';

export class ExportValidator {
  static validateTransactions(transactions: unknown[]): transactions is ExportTransaction[] {
    if (!Array.isArray(transactions)) return false;

    return transactions.every(t =>
      typeof t.id === 'string' &&
      typeof t.date === 'string' &&
      typeof t.type === 'string' &&
      typeof t.marketId === 'number' &&
      typeof t.amount === 'number' &&
      typeof t.outcome === 'string' &&
      typeof t.status === 'string'
    );
  }

  static validatePositions(positions: unknown[]): positions is ExportPosition[] {
    if (!Array.isArray(positions)) return false;

    return positions.every(p =>
      typeof p.marketId === 'number' &&
      typeof p.marketQuestion === 'string' &&
      typeof p.yesStake === 'number' &&
      typeof p.noStake === 'number' &&
      typeof p.currentValue === 'number' &&
      typeof p.status === 'string' &&
      typeof p.createdAt === 'string' &&
      typeof p.updatedAt === 'string'
    );
  }

  static validatePortfolio(portfolio: unknown): portfolio is ExportPortfolio {
    return (
      typeof portfolio.totalValue === 'number' &&
      typeof portfolio.totalInvested === 'number' &&
      typeof portfolio.totalWinnings === 'number' &&
      typeof portfolio.positions === 'number' &&
      typeof portfolio.markets === 'number' &&
      typeof portfolio.exportDate === 'string' &&
      Array.isArray(portfolio.positions_data)
    );
  }

  static validateRewards(rewards: any[]): rewards is ExportReward[] {
    if (!Array.isArray(rewards)) return false;

    return rewards.every(r =>
      typeof r.id === 'string' &&
      typeof r.date === 'string' &&
      typeof r.type === 'string' &&
      typeof r.amount === 'number' &&
      typeof r.source === 'string' &&
      typeof r.description === 'string'
    );
  }

  static validateDateRange(dateFrom?: string, dateTo?: string): boolean {
    if (!dateFrom && !dateTo) return true;

    if (dateFrom && !this.isValidDate(dateFrom)) return false;
    if (dateTo && !this.isValidDate(dateTo)) return false;

    if (dateFrom && dateTo) {
      return new Date(dateFrom) <= new Date(dateTo);
    }

    return true;
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  static validateTaxYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  }

  static getValidationErrors(data: any, type: string): string[] {
    const errors: string[] = [];

    switch (type) {
      case 'transactions':
        if (!Array.isArray(data)) {
          errors.push('Transactions must be an array');
        } else if (!this.validateTransactions(data)) {
          errors.push('Invalid transaction data structure');
        }
        break;

      case 'positions':
        if (!Array.isArray(data)) {
          errors.push('Positions must be an array');
        } else if (!this.validatePositions(data)) {
          errors.push('Invalid position data structure');
        }
        break;

      case 'portfolio':
        if (!this.validatePortfolio(data)) {
          errors.push('Invalid portfolio data structure');
        }
        break;

      case 'rewards':
        if (!Array.isArray(data)) {
          errors.push('Rewards must be an array');
        } else if (!this.validateRewards(data)) {
          errors.push('Invalid reward data structure');
        }
        break;
    }

    return errors;
  }
}

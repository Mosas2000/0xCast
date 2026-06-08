import type { ExportTransaction, ExportPosition, ExportPortfolio, ExportReward, TaxReport } from '@/types/export';
import { convertToCSV, convertToJSON, downloadFile, getMimeType, formatDate, formatCurrency } from './exportHelpers';
import type { ExportType } from '@/types/export';
import { ExportFormat } from '@/types/export';

export class ExportService {
  static async generateTransactionExport(
    transactions: ExportTransaction[],
    format: ExportFormat
  ): Promise<string> {
    if (format === 'csv') {
      return this.transactionsToCSV(transactions);
    } else if (format === 'json') {
      return this.transactionsToJSON(transactions);
    }
    throw new Error('Unsupported export format');
  }

  static async generatePortfolioExport(
    portfolio: ExportPortfolio,
    format: ExportFormat
  ): Promise<string> {
    if (format === 'csv') {
      return this.portfolioToCSV(portfolio);
    } else if (format === 'json') {
      return this.portfolioToJSON(portfolio);
    }
    throw new Error('Unsupported export format');
  }

  static async generatePositionsExport(
    positions: ExportPosition[],
    format: ExportFormat
  ): Promise<string> {
    if (format === 'csv') {
      return this.positionsToCSV(positions);
    } else if (format === 'json') {
      return this.positionsToJSON(positions);
    }
    throw new Error('Unsupported export format');
  }

  static async generateRewardsExport(
    rewards: ExportReward[],
    format: ExportFormat
  ): Promise<string> {
    if (format === 'csv') {
      return this.rewardsToCSV(rewards);
    } else if (format === 'json') {
      return this.rewardsToJSON(rewards);
    }
    throw new Error('Unsupported export format');
  }

  static async generateTaxReport(
    transactions: ExportTransaction[],
    year: number,
    format: ExportFormat
  ): Promise<string> {
    const taxReport = this.buildTaxReport(transactions, year);
    
    if (format === 'csv') {
      return this.taxReportToCSV(taxReport);
    } else if (format === 'json') {
      return this.taxReportToJSON(taxReport);
    }
    throw new Error('Unsupported export format');
  }

  static downloadExport(content: string, fileName: string, format: ExportFormat): void {
    const mimeType = getMimeType(format);
    downloadFile(content, fileName, mimeType);
  }

  private static transactionsToCSV(transactions: ExportTransaction[]): string {
    const headers = ['Date', 'Type', 'Market ID', 'Amount', 'Outcome', 'Status', 'Transaction Hash'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.marketId.toString(),
      formatCurrency(t.amount),
      t.outcome,
      t.status,
      t.txHash || '',
    ]);
    return convertToCSV(headers, rows);
  }

  private static transactionsToJSON(transactions: ExportTransaction[]): string {
    const data = {
      exportDate: new Date().toISOString(),
      type: 'transactions',
      count: transactions.length,
      data: transactions,
    };
    return convertToJSON(data);
  }

  private static positionsToCSV(positions: ExportPosition[]): string {
    const headers = ['Market ID', 'Question', 'YES Stake', 'NO Stake', 'Current Value', 'Status', 'Created', 'Updated'];
    const rows = positions.map(p => [
      p.marketId.toString(),
      p.marketQuestion,
      formatCurrency(p.yesStake),
      formatCurrency(p.noStake),
      formatCurrency(p.currentValue),
      p.status,
      p.createdAt,
      p.updatedAt,
    ]);
    return convertToCSV(headers, rows);
  }

  private static positionsToJSON(positions: ExportPosition[]): string {
    const data = {
      exportDate: new Date().toISOString(),
      type: 'positions',
      count: positions.length,
      data: positions,
    };
    return convertToJSON(data);
  }

  private static portfolioToCSV(portfolio: ExportPortfolio): string {
    const summaryRows = [
      ['Total Value', formatCurrency(portfolio.totalValue)],
      ['Total Invested', formatCurrency(portfolio.totalInvested)],
      ['Total Winnings', formatCurrency(portfolio.totalWinnings)],
      ['Active Positions', portfolio.positions.toString()],
      ['Markets', portfolio.markets.toString()],
      ['Export Date', portfolio.exportDate],
    ];

    const summaryCSV = convertToCSV(['Metric', 'Value'], summaryRows);
    
    if (portfolio.positions_data.length > 0) {
      const positionsCSV = this.positionsToCSV(portfolio.positions_data);
      return `${summaryCSV}\n\n${positionsCSV}`;
    }
    
    return summaryCSV;
  }

  private static portfolioToJSON(portfolio: ExportPortfolio): string {
    const data = {
      exportDate: new Date().toISOString(),
      type: 'portfolio',
      summary: {
        totalValue: portfolio.totalValue,
        totalInvested: portfolio.totalInvested,
        totalWinnings: portfolio.totalWinnings,
        activePositions: portfolio.positions,
        markets: portfolio.markets,
      },
      positions: portfolio.positions_data,
    };
    return convertToJSON(data);
  }

  private static rewardsToCSV(rewards: ExportReward[]): string {
    const headers = ['Date', 'Type', 'Amount', 'Source', 'Description'];
    const rows = rewards.map(r => [
      r.date,
      r.type,
      formatCurrency(r.amount),
      r.source,
      r.description,
    ]);
    return convertToCSV(headers, rows);
  }

  private static rewardsToJSON(rewards: ExportReward[]): string {
    const data = {
      exportDate: new Date().toISOString(),
      type: 'rewards',
      count: rewards.length,
      totalAmount: rewards.reduce((sum, r) => sum + r.amount, 0),
      data: rewards,
    };
    return convertToJSON(data);
  }

  private static buildTaxReport(transactions: ExportTransaction[], year: number): TaxReport {
    const yearTransactions = transactions.filter(t => {
      const txYear = new Date(t.date).getFullYear();
      return txYear === year;
    });

    let totalIncome = 0;
    let totalLosses = 0;

    const taxTransactions = yearTransactions.map(t => {
      const gain = this.calculateTaxableGain(t);
      if (gain > 0) totalIncome += gain;
      if (gain < 0) totalLosses += Math.abs(gain);

      return {
        date: t.date,
        type: t.type,
        proceeds: t.amount,
        cost: 0,
        gain: gain,
      };
    });

    return {
      year,
      totalIncome,
      totalLosses,
      netGainLoss: totalIncome - totalLosses,
      transactions: taxTransactions,
      generatedAt: new Date().toISOString(),
    };
  }

  private static taxReportToCSV(report: TaxReport): string {
    const summaryRows = [
      ['Year', report.year.toString()],
      ['Total Income', formatCurrency(report.totalIncome)],
      ['Total Losses', formatCurrency(report.totalLosses)],
      ['Net Gain/Loss', formatCurrency(report.netGainLoss)],
      ['Generated', report.generatedAt],
    ];

    const summaryCSV = convertToCSV(['Metric', 'Value'], summaryRows);

    if (report.transactions.length > 0) {
      const transactionRows = report.transactions.map(t => [
        t.date,
        t.type,
        formatCurrency(t.proceeds),
        formatCurrency(t.cost),
        formatCurrency(t.gain),
      ]);
      const transactionCSV = convertToCSV(['Date', 'Type', 'Proceeds', 'Cost', 'Gain/Loss'], transactionRows);
      return `${summaryCSV}\n\n${transactionCSV}`;
    }

    return summaryCSV;
  }

  private static taxReportToJSON(report: TaxReport): string {
    return convertToJSON({
      type: 'tax_report',
      ...report,
    });
  }

  private static calculateTaxableGain(transaction: ExportTransaction): number {
    if (transaction.type === 'claim' || transaction.type === 'withdrawal') {
      return transaction.amount;
    }
    if (transaction.type === 'stake' || transaction.type === 'investment') {
      return -transaction.amount;
    }
    return 0;
  }
}

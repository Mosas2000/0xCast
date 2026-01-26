import type { Position, Market } from '../types/market';
import { Transaction } from '../types/transaction';

/**
 * Export positions to CSV
 * @param positions - Array of user positions
 * @returns CSV string
 */
export function exportPositionsCSV(positions: Position[]): string {
    const headers = ['Market ID', 'YES Stake', 'NO Stake', 'Claimed', 'User Address'];
    const rows = positions.map(pos => [
        pos.marketId,
        pos.yesStake,
        pos.noStake,
        pos.claimed,
        pos.userAddress,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Export markets to CSV
 * @param markets - Array of markets
 * @returns CSV string
 */
export function exportMarketsCSV(markets: Market[]): string {
    const headers = ['ID', 'Question', 'Creator', 'Status', 'Total YES', 'Total NO', 'Outcome', 'End Date'];
    const rows = markets.map(market => [
        market.id,
        `"${market.question.replace(/"/g, '""')}"`, // Escape quotes
        market.creator,
        market.status,
        market.totalYesStake,
        market.totalNoStake,
        market.outcome,
        market.endDate,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Export transactions to CSV
 * @param transactions - Array of transactions
 * @returns CSV string
 */
export function exportTransactionsCSV(transactions: Transaction[]): string {
    const headers = ['TX ID', 'Type', 'Status', 'Timestamp', 'Market ID', 'Amount'];
    const rows = transactions.map(tx => [
        tx.txId,
        tx.type,
        tx.status,
        tx.timestamp,
        tx.metadata?.marketId || '',
        tx.metadata?.amount || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Download CSV file
 * @param csvContent - CSV string content
 * @param filename - Filename without extension
 */
export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

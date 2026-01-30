/**
 * Utility for exporting trading data into various formats (CSV, JSON).
 */
export class TradeExport {
    /**
     * Convers a list of trades into a CSV string.
     */
    static toCSV(trades: any[]): string {
        if (!trades.length) return '';

        const headers = Object.keys(trades[0]).join(',');
        const rows = trades.map((trade) =>
            Object.values(trade).map((val) => `"${val}"`).join(',')
        );

        return [headers, ...rows].join('\n');
    }

    /**
     * Simulates a file download in the browser.
     */
    static download(filename: string, content: string, type: string = 'text/csv'): void {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Formats trades for tax report generation.
     */
    static forTaxReport(trades: any[]): any[] {
        return trades.map((t) => ({
            date: new Date(t.timestamp).toISOString(),
            asset: 'STX',
            amount: t.amount,
            pnl: t.payout ? t.payout - t.amount : 0
        }));
    }
}

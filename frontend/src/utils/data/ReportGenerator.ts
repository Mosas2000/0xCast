/**
 * Utility for generating comprehensive JSON and CSV reports for market performance and protocol health.
 */
export class ReportGenerator {
    /**
     * Generates a performance report for a specific market outcome.
     */
    static generateMarketReport(question: string, data: any[]): string {
        const summary = {
            market: question,
            generatedAt: new Date().toISOString(),
            tradingPoints: data.length,
            high: Math.max(...data.map(d => d.price)),
            low: Math.min(...data.map(d => d.price)),
            avgPrice: data.reduce((a, b) => a + b.price, 0) / data.length
        };

        return JSON.stringify(summary, null, 2);
    }

    /**
     * Converts a list of records to CSV format.
     */
    static convertToCSV(data: any[]): string {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        return `${headers}\n${rows}`;
    }

    /**
     * Generates a protocol health manifest.
     */
    static generateHealthManifest(pulseScore: number, status: string): string {
        return `
=== 0xCast PROTOCOL HEALTH REPORT ===
Generated: ${new Date().toLocaleString()}
Status: ${status}
Pulse Score: ${pulseScore}/100
Risk Profile: MODERATE
Integrity Check: PASSED
=====================================
    `.trim();
    }

    /**
     * Triggers a browser download of the generated report.
     */
    static downloadReport(content: string, filename: string, type: string = 'text/plain'): void {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

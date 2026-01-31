/**
 * Utility for monitoring large-volume transactions ("Whale" activity) across the protocol.
 */
export class WhaleWatch {
    private static WHALE_THRESHOLD = 10000; // STX

    /**
     * Filters a list of transactions to identify whale trades.
     */
    static filterWhales(trades: any[]): any[] {
        return trades.filter(t => t.amount >= this.WHALE_THRESHOLD);
    }

    /**
     * Calculates the "Whale Dominance" ratio for a market.
     * @param whaleVolume Total volume from whale trades
     * @param totalVolume Total market volume
     */
    static getWhaleDominance(whaleVolume: number, totalVolume: number): number {
        if (totalVolume === 0) return 0;
        return Number(((whaleVolume / totalVolume) * 100).toFixed(1));
    }

    /**
     * Generates a notification payload for a detected whale trade.
     */
    static getWhaleAlert(address: string, amount: number, outcome: string): string {
        const shortenedAddr = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        return `🐋 WHALE ALERT: ${shortenedAddr} placed ${amount.toLocaleString()} STX on ${outcome}!`;
    }

    /**
     * Identifies if whales are predominantly moving in one direction.
     */
    static getWhaleBias(whaleTrades: any[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
        const yesVolume = whaleTrades.filter(t => t.outcome === 'YES').reduce((sum, t) => sum + t.amount, 0);
        const noVolume = whaleTrades.filter(t => t.outcome === 'NO').reduce((sum, t) => sum + t.amount, 0);

        if (yesVolume > noVolume * 2) return 'BULLISH';
        if (noVolume > yesVolume * 2) return 'BEARISH';
        return 'NEUTRAL';
    }
}

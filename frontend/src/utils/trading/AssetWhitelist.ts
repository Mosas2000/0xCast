/**
 * Utility for managing permissioned assets within the protocol.
 */
export interface Asset {
    id: string;
    name: string;
    symbol: string;
    precision: number;
    contractAddress: string;
}

export class AssetWhitelist {
    private static assets: Asset[] = [
        { id: '1', name: 'Stacks', symbol: 'STX', precision: 6, contractAddress: 'native' },
        { id: '2', name: 'Wrapped USDC', symbol: 'xUSDC', precision: 6, contractAddress: 'SP...USDC' },
        { id: '3', name: 'Bitcoin', symbol: 'sBTC', precision: 8, contractAddress: 'SP...sBTC' }
    ];

    /**
     * Checks if an asset is currently whitelisted.
     */
    static isWhitelisted(symbol: string): boolean {
        return this.assets.some((a) => a.symbol === symbol);
    }

    /**
     * Retrieves asset metadata by symbol.
     */
    static getAsset(symbol: string): Asset | undefined {
        return this.assets.find((a) => a.symbol === symbol);
    }

    /**
     * Returns all supported assets.
     */
    static getAllAssets(): Asset[] {
        return this.assets;
    }

    /**
     * Simulates adding a new asset to the whitelist (Governance mock).
     */
    static proposeAsset(asset: Asset): void {
        console.log(`Gov Proposal: Whitelist ${asset.symbol}`);
    }
}

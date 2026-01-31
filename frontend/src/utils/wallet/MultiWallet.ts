/**
 * Utility for managing multiple wallet addresses and account switching within the application.
 */
export interface WalletAccount {
    address: string;
    name: string;
    type: 'main' | 'trading' | 'vault';
    balance: number;
}

export class MultiWallet {
    private static accounts: WalletAccount[] = [];

    /**
     * Adds a new account to the management list.
     */
    static addAccount(account: WalletAccount): void {
        if (!this.accounts.some(a => a.address === account.address)) {
            this.accounts.push(account);
        }
    }

    /**
     * Retrieves an account by its designated type.
     */
    static getAccountByType(type: WalletAccount['type']): WalletAccount | undefined {
        return this.accounts.find(a => a.type === type);
    }

    /**
     * Calculates the cumulative balance across all managed wallets.
     */
    static getTotalEquity(): number {
        return this.accounts.reduce((sum, a) => sum + a.balance, 0);
    }

    /**
     * Switches the "active" context to a specific address.
     */
    static switchActive(address: string): void {
        console.log(`Active Wallet Switched to: ${address}`);
    }

    /**
     * Returns all managed accounts.
     */
    static listAccounts(): WalletAccount[] {
        return this.accounts;
    }
}

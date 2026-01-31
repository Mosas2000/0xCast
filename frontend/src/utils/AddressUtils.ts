/**
 * Utility functions for handling and formatting wallet addresses.
 */
export class AddressUtils {
    /**
     * Shortens a long wallet address (e.g., SP2...1234 -> SP2...1234).
     */
    static shorten(address: string, prefixLen: number = 4, suffixLen: number = 4): string {
        if (!address) return '';
        if (address.length <= prefixLen + suffixLen) return address;
        return `${address.substring(0, prefixLen)}...${address.substring(address.length - suffixLen)}`;
    }

    /**
     * Validates if a string looks like a Stacks address.
     */
    static isValidStacksAddress(address: string): boolean {
        return /^S[PM1-9A-HJ-NP-Z]{38,47}$/.test(address);
    }

    /**
     * Formats an address for display in logs or UI lists.
     */
    static forDisplay(address: string): string {
        return this.shorten(address, 6, 6);
    }
}

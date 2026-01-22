import { useState, useEffect, useCallback } from 'react';
import { STACKS_API_URL } from '../constants/contract';

interface UseWalletBalanceOptions {
    address: string | null;
    enabled?: boolean;
}

interface UseWalletBalanceResult {
    balance: number; // in microSTX
    balanceFormatted: string; // formatted for display
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook to fetch connected wallet's STX balance
 * Updates on transactions and provides formatted display
 */
export function useWalletBalance({
    address,
    enabled = true,
}: UseWalletBalanceOptions): UseWalletBalanceResult {
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!address || !enabled) {
            setBalance(0);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/stx`);

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            const balanceInMicroSTX = parseInt(data.balance, 10);
            setBalance(balanceInMicroSTX);
        } catch (err) {
            console.error('Error fetching wallet balance:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch balance');
            setBalance(0);
        } finally {
            setIsLoading(false);
        }
    }, [address, enabled]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Format balance for display (convert microSTX to STX)
    const balanceFormatted = (balance / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return {
        balance,
        balanceFormatted,
        isLoading,
        error,
        refresh: fetchBalance,
    };
}

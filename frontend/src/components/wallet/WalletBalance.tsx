import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';

export const WalletBalance: React.FC = () => {
    const { address, isConnected } = useWallet();
    const [balance, setBalance] = useState<string>('0.00');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isConnected && address) {
            setLoading(true);
            fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`)
                .then(res => res.json())
                .then(data => {
                    const stxBalance = parseInt(data.stx.balance) / 1000000;
                    setBalance(stxBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching balance:', err);
                    setLoading(false);
                });
        }
    }, [address, isConnected]);

    if (!isConnected) return null;

    return (
        <div className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 transition-all group">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-400 text-sm font-medium">STX</span>
            <span className="text-white text-sm font-bold">
                {loading ? (
                    <div className="w-12 h-4 bg-slate-700 animate-pulse rounded" />
                ) : (
                    balance
                )}
            </span>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <span className="text-slate-400 text-xs font-mono">
                {address?.slice(0, 4)}...{address?.slice(-4)}
            </span>
        </div>
    );
};

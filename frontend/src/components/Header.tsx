import { APP_NAME, APP_DESCRIPTION } from '../constants/contract';
import { WalletConnect } from './WalletConnect';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
    totalMarkets: number;
    totalVolume?: number;
    onRefresh?: () => void;
}

export function Header({ totalMarkets, totalVolume = 0, onRefresh }: HeaderProps) {
    return (
        <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">0x</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
                            <p className="text-xs text-slate-400">{APP_DESCRIPTION}</p>
                        </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex items-center space-x-6">
                        {/* Quick Stats */}
                        <div className="hidden md:flex items-center space-x-4 text-sm">
                            <div className="text-slate-400">
                                <span className="font-medium text-white">{totalMarkets}</span> Markets
                            </div>
                            <div className="text-slate-400">
                                <span className="font-medium text-white">{totalVolume.toFixed(2)}</span> STX Volume
                            </div>
                        </div>

                        {/* Refresh Button */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Refresh data"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Wallet Connect */}
                        <WalletConnect />
                    </div>
                </div>
            </div>
        </header>
    );
}

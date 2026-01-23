import { useState } from 'react';
import { APP_NAME, APP_DESCRIPTION, CONTRACT_ADDRESS } from '../constants/contract';
import { WalletConnect } from './WalletConnect';
import { NotificationBell } from './NotificationBell';
import { NetworkStatus } from './NetworkStatus';
import { DesktopNav } from './DesktopNav';
import { Sidebar } from './Sidebar';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { useIsMobile } from '../hooks/useIsMobile';

interface HeaderProps {
    totalMarkets: number;
    totalVolume?: number;
    onRefresh?: () => void;
}

export function Header({ totalMarkets, totalVolume = 0, onRefresh }: HeaderProps) {
    const { blockHeight } = useCurrentBlock();
    const { isMobile } = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { id: 'markets', label: 'Markets', href: '#markets' },
        { id: 'create', label: 'Create', href: '#create' },
        { id: 'portfolio', label: 'Portfolio', href: '#portfolio' },
    ];

    return (
        <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                {/* Top Row - Network Status and Contract Info */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/30">
                    <NetworkStatus />
                    <a
                        href={`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}?chain=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                    >
                        <span>Contract: {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-6)}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* Main Header Row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Mobile Hamburger Menu */}
                    {isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-slate-400 hover:text-white transition-colors lg:hidden"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    {/* Logo and Title */}
                    <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg lg:text-xl">0x</span>
                        </div>
                        <div>
                            <h1 className="text-lg lg:text-2xl font-bold text-white">{APP_NAME}</h1>
                            <p className="text-xs text-slate-400 hidden sm:block">{APP_DESCRIPTION}</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <DesktopNav items={navItems} activeId="markets" className="flex-1" />

                    {/* Stats and Actions */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Quick Stats - Hidden on mobile */}
                        <div className="hidden lg:flex items-center space-x-4 text-sm">
                            <div className="text-slate-400">
                                <span className="font-medium text-white">{totalMarkets}</span> Markets
                            </div>
                            <div className="text-slate-400">
                                <span className="font-medium text-white">{totalVolume.toFixed(2)}</span> STX
                            </div>
                            <div className="text-slate-400">
                                Block <span className="font-medium text-white">{blockHeight.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Notification Bell - Hidden on mobile */}
                        <div className="hidden sm:block">
                            <NotificationBell />
                        </div>

                        {/* Wallet Connect */}
                        <WalletConnect />
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Mobile Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                    <div className="text-sm">
                        <span className="text-slate-400">Markets:</span>
                        <span className="ml-2 font-medium text-white">{totalMarkets}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-slate-400">Volume:</span>
                        <span className="ml-2 font-medium text-white">{totalVolume.toFixed(2)} STX</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-slate-400">Block:</span>
                        <span className="ml-2 font-medium text-white">{blockHeight.toLocaleString()}</span>
                    </div>
                </div>
            </Sidebar>
        </header>
    );
}

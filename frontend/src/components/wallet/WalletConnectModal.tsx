import React from 'react';
import { useWallet } from './WalletProvider';

interface WalletConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
    const { connect } = useWallet();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-slate-400 text-sm">
                        Connect your Stacks wallet to start trading on prediction markets.
                    </p>

                    <button
                        onClick={() => {
                            connect();
                            onClose();
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <img src="/leather-logo.png" alt="Leather" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-semibold">Leather</div>
                                <div className="text-slate-500 text-xs">Desktop & Browser Extension</div>
                            </div>
                        </div>
                        <div className="text-slate-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            connect();
                            onClose();
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <img src="/xverse-logo.png" alt="Xverse" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-semibold">Xverse</div>
                                <div className="text-slate-500 text-xs">Mobile & Browser Extension</div>
                            </div>
                        </div>
                        <div className="text-slate-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                <div className="p-6 bg-slate-800/50 border-t border-slate-800">
                    <p className="text-center text-xs text-slate-500">
                        New to Stacks? <a href="https://stacks.co/wallets" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Learn more about wallets</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

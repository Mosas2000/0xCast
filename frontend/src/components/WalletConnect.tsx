import { useWallet } from '../hooks/useWallet';

export function WalletConnect() {
    const { address, isConnected, connect, disconnect } = useWallet();

    const shortenAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <div className="flex items-center space-x-3">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-mono text-slate-300">
                            {shortenAddress(address)}
                        </span>
                    </div>
                </div>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
        >
            Connect Wallet
        </button>
    );
}

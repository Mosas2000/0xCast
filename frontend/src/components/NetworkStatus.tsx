import { memo, useState, useEffect } from 'react';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { apiClient } from '../utils/apiClient';

interface NetworkStatusProps {
    className?: string;
}

interface NetworkHealth {
    isHealthy: boolean;
    isConnected: boolean;
    latency: number | null;
}

export const NetworkStatus = memo(function NetworkStatus({ className = '' }: NetworkStatusProps) {
    const { blockHeight, isLoading, error } = useCurrentBlock();
    const [health, setHealth] = useState<NetworkHealth>({
        isHealthy: true,
        isConnected: true,
        latency: null,
    });

    useEffect(() => {
        const checkHealth = async () => {
            const startTime = Date.now();
            try {
                await apiClient.get('/v2/info');
                const latency = Date.now() - startTime;
                setHealth({
                    isHealthy: true,
                    isConnected: true,
                    latency,
                });
            } catch (err) {
                setHealth({
                    isHealthy: false,
                    isConnected: false,
                    latency: null,
                });
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (!health.isConnected) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (error) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-green-400 bg-green-500/10 border-green-500/20';
    };

    const getStatusText = () => {
        if (!health.isConnected) return 'Disconnected';
        if (error) return 'Connection Issue';
        return 'Connected to Mainnet';
    };

    const getStatusIcon = () => {
        if (!health.isConnected) return '⚠️';
        if (error) return '⚡';
        return '🟢';
    };

    return (
        <div className={`inline-flex items-center gap-3 px-4 py-2 ${getStatusColor()} border rounded-lg ${className}`}>
            <span className="text-sm">{getStatusIcon()}</span>
            
            <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide">
                    {getStatusText()}
                </span>
                {health.isConnected && !isLoading && blockHeight > 0 && (
                    <span className="text-xs opacity-75">
                        Block {blockHeight.toLocaleString()}
                        {health.latency && ` · ${health.latency}ms`}
                    </span>
                )}
            </div>

            {health.isHealthy && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
            )}
        </div>
    );
});

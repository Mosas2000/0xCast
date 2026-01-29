import React from 'react';

/**
 * Real-time status indicator showing system health (e.g., Blockchain Sync, API Status).
 */
export const SystemHealth: React.FC<{ status?: 'operational' | 'syncing' | 'degraded' }> = ({
    status = 'operational'
}) => {
    const config = {
        operational: { color: 'bg-accent-500', label: 'System Operational' },
        syncing: { color: 'bg-primary-500', label: 'Syncing Nodes' },
        degraded: { color: 'bg-amber-500', label: 'Service Interruption' }
    };

    const { color, label } = config[status];

    return (
        <div className="flex items-center space-x-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <div className={`absolute w-4 h-4 rounded-full ${color} opacity-40 animate-ping`} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {label}
            </span>
        </div>
    );
};

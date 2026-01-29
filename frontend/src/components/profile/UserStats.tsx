import React from 'react';

interface StatBoxProps {
    label: string;
    value: string | number;
    suffix?: string;
    color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, suffix, color }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 group hover:border-slate-700 transition-colors">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="flex items-baseline space-x-1">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            {suffix && <div className="text-xs font-bold text-slate-600 uppercase">{suffix}</div>}
        </div>
    </div>
);

interface UserStatsProps {
    winRate: number;
    totalTrades: number;
    netWorth: string;
}

export const UserStats: React.FC<UserStatsProps> = ({ winRate, totalTrades, netWorth }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox
                label="Success Rate"
                value={winRate}
                suffix="%"
                color="text-green-500"
            />
            <StatBox
                label="Total Trades"
                value={totalTrades}
                color="text-primary-400"
            />
            <StatBox
                label="Net Worth"
                value={netWorth}
                suffix="STX"
                color="text-white"
            />
        </div>
    );
};

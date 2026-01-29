import React from 'react';

interface StatItemProps {
    label: string;
    value: string;
    subValue?: string;
    trend?: 'up' | 'down';
}

const StatItem: React.FC<StatItemProps> = ({ label, value, subValue, trend }) => (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        {subValue && (
            <div className={`text-xs font-medium flex items-center space-x-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'
                }`}>
                {trend === 'up' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                )}
                {trend === 'down' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                )}
                <span>{subValue}</span>
            </div>
        )}
    </div>
);

export const PortfolioStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatItem
                label="Net Worth"
                value="1,245.50 STX"
                subValue="+12.5% this month"
                trend="up"
            />
            <StatItem
                label="Active Stakes"
                value="450.00 STX"
                subValue="4 Markets active"
            />
            <StatItem
                label="Realized P&L"
                value="+120.25 STX"
                subValue="Last trade +15.2 STX"
                trend="up"
            />
            <StatItem
                label="Success Rate"
                value="68.4%"
                subValue="13/19 Markets won"
            />
        </div>
    );
};

import React from 'react';
import { DataTable } from './DataTable';
import { formatCurrency, formatPercentage } from '../utils/analytics';

export const MarketPerformanceList: React.FC = () => {
    const mockMarkets = [
        { id: 1, name: 'Bitcoin Price End of Year', volume: 50000, liquidity: 20000, roi: 12.5, status: 'Active' },
        { id: 2, name: 'Stacks Nakamoto Release Date', volume: 120000, liquidity: 45000, roi: -5.2, status: 'Active' },
        { id: 3, name: 'ETH ETF Approval', volume: 85000, liquidity: 30000, roi: 24.8, status: 'Resolved' },
        { id: 4, name: 'Solana Mobile 2 Sales', volume: 32000, liquidity: 12000, roi: 8.4, status: 'Active' },
    ];

    const columns = [
        { key: 'name', label: 'Market Name' },
        {
            key: 'volume',
            label: 'Volume',
            render: (val: number) => <span className="font-bold">{formatCurrency(val)}</span>
        },
        {
            key: 'roi',
            label: 'Avg ROI',
            render: (val: number) => (
                <span className={val > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {formatPercentage(val)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val: string) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {val}
                </span>
            )
        }
    ];

    return (
        <DataTable
            title="Top Performing Markets"
            columns={columns}
            data={mockMarkets}
        />
    );
};

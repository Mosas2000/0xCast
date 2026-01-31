import React from 'react';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';

export const TradeExporter: React.FC = () => {
    const mockTrades = [
        { date: '2026-01-30', market: 'BTC to $50k', outcome: 'YES', amount: 100, result: 'win' },
        { date: '2026-01-29', market: 'ETH to $3k', outcome: 'NO', amount: 50, result: 'loss' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Export Trade History</h3>
            <div className="space-y-3">
                <button
                    onClick={() => exportToCSV(mockTrades, 'trades.csv')}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Export as CSV
                </button>
                <button
                    onClick={() => exportToJSON(mockTrades, 'trades.json')}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Export as JSON
                </button>
            </div>
        </div>
    );
};

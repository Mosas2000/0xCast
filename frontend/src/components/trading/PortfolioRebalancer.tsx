import React, { useState } from 'react';
import { calculateRebalance } from '../../utils/rebalanceUtils';

export const PortfolioRebalancer: React.FC = () => {
    const [portfolio] = useState({ 'market1': 500, 'market2': 300 });
    const [targetAllocation, setTargetAllocation] = useState({ 'market1': 60, 'market2': 40 });

    const totalValue = Object.values(portfolio).reduce((a, b) => a + b, 0);
    const trades = calculateRebalance(portfolio, targetAllocation, totalValue);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Portfolio Rebalancer</h3>
            <div className="space-y-4">
                {trades.map((trade, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <span className={trade.action === 'buy' ? 'text-green-600' : 'text-red-600'}>
                            {trade.action.toUpperCase()}
                        </span> {trade.amount} STX in {trade.market}
                    </div>
                ))}
                <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Execute Rebalance
                </button>
            </div>
        </div>
    );
};

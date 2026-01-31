import React, { useState } from 'react';

interface PriceAlert {
    id: string;
    marketId: string;
    marketTitle: string;
    targetPrice: number;
    condition: 'above' | 'below';
}

export const PriceAlerts: React.FC = () => {
    const [alerts] = useState<PriceAlert[]>([
        { id: '1', marketId: 'm1', marketTitle: 'BTC to $50k', targetPrice: 75, condition: 'above' },
    ]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Price Alerts</h3>
            <div className="space-y-2">
                {alerts.map(alert => (
                    <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold">{alert.marketTitle}</div>
                        <div className="text-sm text-gray-600">
                            Alert when price goes {alert.condition} {alert.targetPrice}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

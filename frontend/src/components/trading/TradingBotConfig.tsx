import React, { useState } from 'react';

interface BotStrategy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    parameters: Record<string, any>;
}

export const TradingBotConfig: React.FC = () => {
    const [bots, setBots] = useState<BotStrategy[]>([
        { id: '1', name: 'Momentum Trader', description: 'Follows market trends', enabled: false, parameters: { threshold: 5 } },
        { id: '2', name: 'Mean Reversion', description: 'Buys dips, sells peaks', enabled: false, parameters: { deviation: 10 } },
    ]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Trading Bots</h3>
            <div className="space-y-3">
                {bots.map(bot => (
                    <div key={bot.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="font-semibold">{bot.name}</h4>
                                <p className="text-sm text-gray-600">{bot.description}</p>
                            </div>
                            <button className={`px-4 py-2 rounded-lg ${bot.enabled ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                {bot.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { useStopLoss } from '../../hooks/useStopLoss';

interface StopLossFormProps {
    marketId: string;
    marketTitle: string;
    currentPrice: number;
    userAddress?: string;
}

export const StopLossForm: React.FC<StopLossFormProps> = ({
    marketId,
    marketTitle,
    currentPrice,
    userAddress,
}) => {
    const { createStopLoss } = useStopLoss(userAddress);
    const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
    const [stopPrice, setStopPrice] = useState(currentPrice * 0.9);
    const [amount, setAmount] = useState(100);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createStopLoss({ marketId, marketTitle, outcome, stopPrice, amount });
        alert('Stop-loss order created!');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Set Stop-Loss</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setOutcome('YES')} className={`flex-1 py-2 rounded-lg ${outcome === 'YES' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>YES</button>
                        <button type="button" onClick={() => setOutcome('NO')} className={`flex-1 py-2 rounded-lg ${outcome === 'NO' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>NO</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stop Price (%)</label>
                    <input type="number" value={stopPrice} onChange={(e) => setStopPrice(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (STX)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <button type="submit" className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Create Stop-Loss</button>
            </div>
        </form>
    );
};

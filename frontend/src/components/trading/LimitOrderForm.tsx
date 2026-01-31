import React, { useState } from 'react';
import { useLimitOrders } from '../../hooks/useLimitOrders';

interface LimitOrderFormProps {
    marketId: string;
    marketTitle: string;
    currentPrice: number;
    userAddress?: string;
    onSuccess?: () => void;
}

export const LimitOrderForm: React.FC<LimitOrderFormProps> = ({
    marketId,
    marketTitle,
    currentPrice,
    userAddress,
    onSuccess,
}) => {
    const { createOrder, loading } = useLimitOrders(userAddress);
    const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
    const [targetPrice, setTargetPrice] = useState(currentPrice);
    const [amount, setAmount] = useState(100);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userAddress) {
            alert('Please connect your wallet');
            return;
        }

        await createOrder({
            marketId,
            marketTitle,
            outcome,
            targetPrice,
            amount,
        });

        onSuccess?.();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Limit Order</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outcome
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setOutcome('YES')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${outcome === 'YES'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            YES
                        </button>
                        <button
                            type="button"
                            onClick={() => setOutcome('NO')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${outcome === 'NO'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            NO
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Price (%)
                    </label>
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        min={0}
                        max={100}
                        step={0.1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Current price: {currentPrice}%
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (STX)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {loading ? 'Creating Order...' : 'Create Limit Order'}
                </button>
            </div>
        </form>
    );
};

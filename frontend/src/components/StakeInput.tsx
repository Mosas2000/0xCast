import { useState, useEffect } from 'react';
import { microStxToStx, stxToMicroStx } from '../constants/markets';

interface StakeInputProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    min?: number;
    balance?: number;
    className?: string;
}

export function StakeInput({ value, onChange, max = 10000, min = 1, balance = 0, className = '' }: StakeInputProps) {
    const [inputValue, setInputValue] = useState(value.toString());
    const [error, setError] = useState('');

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
            setError('Please enter a valid number');
            return;
        }

        if (numVal < min) {
            setError(`Minimum stake is ${min} STX`);
        } else if (numVal > max) {
            setError(`Maximum stake is ${max} STX`);
        } else if (balance > 0 && stxToMicroStx(numVal) > balance) {
            setError('Insufficient balance');
        } else {
            setError('');
            onChange(numVal);
        }
    };

    const setQuickAmount = (amount: number) => {
        const actualAmount = amount === -1 ? microStxToStx(balance) : amount;
        const clamped = Math.min(max, Math.max(min, actualAmount));
        setInputValue(clamped.toString());
        onChange(clamped);
        setError('');
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Stake Amount
            </label>

            <div className="relative">
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    step="0.1"
                    className="w-full px-4 py-3 pr-16 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    STX
                </span>
            </div>

            {balance > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                    Available: {microStxToStx(balance).toFixed(2)} STX
                </p>
            )}

            {error && (
                <p className="text-xs text-red-400 mt-1">{error}</p>
            )}

            <div className="flex gap-2 mt-3">
                <button
                    type="button"
                    onClick={() => setQuickAmount(10)}
                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                    10 STX
                </button>
                <button
                    type="button"
                    onClick={() => setQuickAmount(50)}
                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                    50 STX
                </button>
                <button
                    type="button"
                    onClick={() => setQuickAmount(100)}
                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                    100 STX
                </button>
                {balance > 0 && (
                    <button
                        type="button"
                        onClick={() => setQuickAmount(-1)}
                        className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                    >
                        MAX
                    </button>
                )}
            </div>
        </div>
    );
}

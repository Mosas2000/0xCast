import React from 'react';

interface MaxStakeButtonProps {
    balance: string | number;
    onMaxClick: (value: string) => void;
    disabled?: boolean;
}

/**
 * Utility button for quickly setting the maximum available stake.
 */
export const MaxStakeButton: React.FC<MaxStakeButtonProps> = ({
    balance,
    onMaxClick,
    disabled = false
}) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onMaxClick(balance.toString())}
            className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider px-2 py-1 bg-primary-500/10 hover:bg-primary-500/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Max: {balance}
        </button>
    );
};

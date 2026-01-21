interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function Switch({ checked, onChange, label, disabled = false, className = '' }: SwitchProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!disabled) onChange(!checked);
        }
    };

    return (
        <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`.trim()}>
            <div
                role="switch"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-slate-700'
                    } ${disabled ? '' : 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </div>

            {label && (
                <span className="text-sm font-medium text-slate-300">{label}</span>
            )}
        </label>
    );
}

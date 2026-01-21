interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    indeterminate?: boolean;
    disabled?: boolean;
    className?: string;
}

export function Checkbox({
    checked,
    onChange,
    label,
    indeterminate = false,
    disabled = false,
    className = '',
}: CheckboxProps) {
    return (
        <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`.trim()}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`w-5 h-5 border-2 rounded transition-all ${checked || indeterminate
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-slate-800 border-slate-600'
                        } ${disabled ? '' : 'hover:border-primary-500'}`}
                >
                    {checked && !indeterminate && (
                        <svg
                            className="w-full h-full text-white animate-in zoom-in duration-150"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {indeterminate && (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-3 h-0.5 bg-white" />
                        </div>
                    )}
                </div>
            </div>

            {label && (
                <span className="text-sm font-medium text-slate-300">{label}</span>
            )}
        </label>
    );
}

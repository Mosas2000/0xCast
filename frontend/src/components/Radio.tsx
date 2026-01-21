interface RadioProps {
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    label?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
}

export function Radio({
    value,
    checked,
    onChange,
    label,
    name,
    disabled = false,
    className = '',
}: RadioProps) {
    return (
        <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`.trim()}>
            <div className="relative">
                <input
                    type="radio"
                    value={value}
                    checked={checked}
                    onChange={() => !disabled && onChange(value)}
                    name={name}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${checked
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-slate-800 border-slate-600'
                        } ${disabled ? '' : 'hover:border-primary-500'}`}
                >
                    {checked && (
                        <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in duration-150" />
                    )}
                </div>
            </div>

            {label && (
                <span className="text-sm font-medium text-slate-300">{label}</span>
            )}
        </label>
    );
}

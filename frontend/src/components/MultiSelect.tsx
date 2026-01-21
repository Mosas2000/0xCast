import { useState, useRef, useEffect } from 'react';
import { SelectOption } from './Select';

interface MultiSelectProps {
    options: SelectOption[];
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    values,
    onChange,
    placeholder = 'Select options',
    className = '',
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((opt) => values.includes(opt.value));

    const handleToggle = (value: string) => {
        if (values.includes(value)) {
            onChange(values.filter((v) => v !== value));
        } else {
            onChange([...values, value]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={selectRef} className={`relative ${className}`.trim()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-left flex items-center justify-between hover:border-slate-600 transition-colors"
            >
                <span className={selectedOptions.length > 0 ? 'text-white' : 'text-slate-400'}>
                    {selectedOptions.length > 0
                        ? `${selectedOptions.length} selected`
                        : placeholder}
                </span>
                <div className="flex items-center space-x-2">
                    {selectedOptions.length > 0 && (
                        <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                            {selectedOptions.length}
                        </span>
                    )}
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${option.disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-slate-700'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={values.includes(option.value)}
                                onChange={() => !option.disabled && handleToggle(option.value)}
                                disabled={option.disabled}
                                className="w-4 h-4 text-primary-600 bg-slate-900 border-slate-600 rounded focus:ring-primary-500"
                            />
                            <span className="ml-3 text-sm text-slate-300">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

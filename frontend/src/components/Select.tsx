import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchable = false,
    className = '',
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
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
                <span className={selectedOption ? 'text-white' : 'text-slate-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {searchable && (
                        <div className="p-2 border-b border-slate-700">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    )}

                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-400">No options found</div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    if (!option.disabled) {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }
                                }}
                                disabled={option.disabled}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${option.value === value
                                        ? 'bg-primary-600 text-white'
                                        : option.disabled
                                            ? 'text-slate-600 cursor-not-allowed'
                                            : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

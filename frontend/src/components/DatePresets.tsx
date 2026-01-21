interface DatePresetsProps {
    onSelect: (date: Date) => void;
    type: 'end' | 'resolution';
    className?: string;
}

interface Preset {
    label: string;
    days: number;
}

const presets: Preset[] = [
    { label: '1 Day', days: 1 },
    { label: '1 Week', days: 7 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
];

export function DatePresets({ onSelect, type, className = '' }: DatePresetsProps) {
    const handlePresetClick = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        onSelect(date);
    };

    return (
        <div className={className}>
            <p className="text-sm text-slate-400 mb-2">
                Quick {type === 'end' ? 'End' : 'Resolution'} Date
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset.days)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-primary-500 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
                Or select a custom date below
            </p>
        </div>
    );
}

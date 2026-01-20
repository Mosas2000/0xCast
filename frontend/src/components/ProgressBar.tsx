interface ProgressBarProps {
    percentage: number;
    label?: string;
    color?: 'green' | 'red' | 'blue';
    className?: string;
}

const colorClasses = {
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
};

export function ProgressBar({ percentage, label, color = 'blue', className = '' }: ProgressBarProps) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    const colorClass = colorClasses[color];

    return (
        <div className={className}>
            {label && (
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>{label}</span>
                    <span>{clampedPercentage.toFixed(1)}%</span>
                </div>
            )}

            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </div>
        </div>
    );
}

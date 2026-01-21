interface DataPoint {
    timestamp: number;
    value: number;
}

interface UserPerformanceChartProps {
    data: DataPoint[];
    className?: string;
}

export function UserPerformanceChart({ data, className = '' }: UserPerformanceChartProps) {
    if (data.length === 0) {
        return (
            <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center ${className}`.trim()}>
                <p className="text-slate-400">No performance data yet</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
    const minValue = Math.min(...data.map(d => d.value));

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`.trim()}>
            <h3 className="text-lg font-bold text-white mb-4">Performance Over Time</h3>

            <div className="relative h-64">
                {/* Y-axis */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-400">
                    <span>{maxValue.toFixed(0)}</span>
                    <span>0</span>
                    <span>{minValue.toFixed(0)}</span>
                </div>

                {/* Chart Area */}
                <div className="ml-12 h-full relative">
                    {/* Zero line */}
                    <div className="absolute left-0 right-0 top-1/2 border-t border-slate-600" />

                    {/* Simple bar chart */}
                    <div className="flex items-end justify-around h-full">
                        {data.map((point, index) => {
                            const heightPercent = (Math.abs(point.value) / maxValue) * 50;
                            const isPositive = point.value >= 0;

                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center justify-center"
                                    title={`${new Date(point.timestamp).toLocaleDateString()}: ${point.value.toFixed(2)} STX`}
                                >
                                    <div
                                        className={`w-full max-w-[20px] ${isPositive ? 'bg-green-500' : 'bg-red-500'
                                            } rounded-t`}
                                        style={{
                                            height: `${heightPercent}%`,
                                            marginTop: isPositive ? 'auto' : '0',
                                            marginBottom: isPositive ? '0' : 'auto',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="ml-12 mt-2 flex justify-between text-xs text-slate-400">
                    <span>{new Date(data[0].timestamp).toLocaleDateString()}</span>
                    <span>{new Date(data[data.length - 1].timestamp).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

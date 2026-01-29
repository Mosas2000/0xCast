import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface VolumeData {
    name: string;
    value: number;
    color: string;
}

interface VolumeDistributionProps {
    data: VolumeData[];
}

export const VolumeDistribution: React.FC<VolumeDistributionProps> = ({ data }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px]">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Volume Distribution</h3>
            <div className="h-full">
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(val) => <span className="text-xs text-slate-400 font-bold uppercase">{val}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

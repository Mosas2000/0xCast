import React from 'react';

interface MetricGroupProps {
    title: string;
    children: React.ReactNode;
}

export const MetricGroup: React.FC<MetricGroupProps> = ({ title, children }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 px-1">
                <div className="w-1 h-5 bg-indigo-600 rounded-full" />
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {children}
            </div>
        </div>
    );
};

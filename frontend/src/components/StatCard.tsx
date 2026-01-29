import React from 'react';
import { Card } from './Card';

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'indigo' | 'green' | 'red' | 'yellow' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    color = 'indigo'
}) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-700',
        green: 'bg-green-50 text-green-700',
        red: 'bg-red-50 text-red-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        blue: 'bg-blue-50 text-blue-700'
    };

    return (
        <Card className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h4 className={`text-3xl font-extrabold tracking-tight ${colorClasses[color].split(' ')[1]}`}>
                {value}
            </h4>
            {subValue && (
                <p className="mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {subValue}
                </p>
            )}
        </Card>
    );
};

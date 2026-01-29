import React from 'react';
import { Card } from './Card';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-20 bg-gray-100 rounded-2xl w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="h-32 bg-gray-50 border-none" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-80 bg-gray-50 border-none" />
                    <Card className="h-64 bg-gray-50 border-none" />
                </div>
                <div className="space-y-6">
                    <Card className="h-[500px] bg-gray-50 border-none" />
                </div>
            </div>
        </div>
    );
};

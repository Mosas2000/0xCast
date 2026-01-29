import React from 'react';
import { AnalyticsNav } from './AnalyticsNav';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            <AnalyticsNav />
            <main className="flex-1 lg:ml-64 transition-all duration-300">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

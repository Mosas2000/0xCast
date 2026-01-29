import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { AnalyticsRoutes } from './pages/AnalyticsRoutes';
import { AnalyticsErrorBoundary } from './components/AnalyticsErrorBoundary';
import './styles/analytics.css';
import './styles/animations.css';

export const FinalDashboardEntry: React.FC = () => {
    return (
        <AnalyticsErrorBoundary>
            <BrowserRouter>
                <DashboardLayout>
                    <AnalyticsRoutes />
                </DashboardLayout>
            </BrowserRouter>
        </AnalyticsErrorBoundary>
    );
};

export default FinalDashboardEntry;

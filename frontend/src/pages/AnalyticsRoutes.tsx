import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PlatformOverviewPage } from './PlatformOverviewPage';
import { MarketAnalyticsPage } from './MarketAnalyticsPage';
import { UserPortfolioAnalytics } from './UserPortfolioAnalytics';
import { LeaderboardPage } from './LeaderboardPage';

export const AnalyticsRoutes: React.FC = () => {
    return (
        <Routes>
            <Route index element={<PlatformOverviewPage />} />
            <Route path="markets/:id" element={<MarketAnalyticsPage />} />
            <Route path="portfolio" element={<UserPortfolioAnalytics />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/analytics" replace />} />
        </Routes>
    );
};
